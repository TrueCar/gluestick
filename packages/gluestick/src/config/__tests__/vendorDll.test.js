/* @flow */

jest.mock('webpack', () => ({
  DefinePlugin: class {},
  DllPlugin: class {},
  optimize: {
    UglifyJsPlugin: class {},
  },
}));
jest.mock('../webpack/progressHandler.js');
jest.mock('fs');
jest.mock('../../utils.js');
jest.mock('./vendor-manifest.json', () => ({ name: 'vendor_1234' }), {
  virtual: true,
});
jest.mock(
  './mismatch/vendor-manifest.json',
  () => ({
    name: 'vendor_1234',
    validationMetadata: {
      entryParts: ['src/vendor.js'],
      sourceHash: '',
    },
  }),
  { virtual: true },
);
jest.mock(
  './mismatch-deps/vendor-manifest.json',
  () => ({
    name: 'vendor_1234',
    validationMetadata: {
      entryParts: ['src/vendor.js'],
      sourceHash: '1c2ff7d6dff16089846b72770c41783b87aa4a55', // hash of 'import "react";'
    },
  }),
  { virtual: true },
);

const originalProcessCwd = process.cwd.bind(process);
// $FlowIgnore
process.cwd = () => {
  return `${originalProcessCwd()}/packages/gluestick`;
};

const path = require('path');
const fs = require('fs');
const sha1 = require('sha1');
const vendorDll = require('../vendorDll');
const utils = require('../../utils');
const commandApi = require('../../__tests__/mocks/context').commandApi;

const getMockedConext = (
  customLoggingFns = {},
  customGsConfig = {},
  customWebpackConfig = {},
) => ({
  config: {
    GSConfig: {
      ...commandApi.getContextConfig().GSConfig,
      ...customGsConfig,
    },
    webpackConfig: {
      ...commandApi.getContextConfig().webpackConfig,
      ...customWebpackConfig,
    },
  },
  logger: {
    ...commandApi.getLogger(),
    ...customLoggingFns,
  },
});

describe('config/vendorDll', () => {
  afterAll(() => {
    // $FlowIgnore
    process.cwd = originalProcessCwd;
  });

  describe('getConfig', () => {
    beforeEach(() => {
      // $FlowIgnore `utils.requireModule` is mocked
      utils.requireModule.mockImplementationOnce(() => ({}));
    });

    it('should throw an error if vendor entry file does not exist', () => {
      const fatalLogFn = jest.fn();
      vendorDll.getConfig(
        getMockedConext(
          { fatal: fatalLogFn },
          { vendorSourcePath: 'non-existent' },
        ),
        [],
      );
      expect(fatalLogFn).toHaveBeenCalledTimes(1);
    });

    it('should return base config', () => {
      const baseConfig = vendorDll.getConfig(getMockedConext(), []);
      expect(baseConfig).toBeDefined();
      expect(baseConfig).not.toBeNull();
    });

    it('should return modifie base config', () => {
      // $FlowIgnore `utils.requireModule` is mocked
      utils.requireModule.mockReset();
      // $FlowIgnore `utils.requireModule` is mocked
      utils.requireModule.mockImplementationOnce(() => ({
        webpackVendorDllConfig: config => ({ ...config, bail: false }),
      }));
      // $FlowIgnore stripped version of plugins with the essentials only
      const modifiedConfig = vendorDll.getConfig(getMockedConext(), [
        {
          postOverwrites: {
            vendorDllWebpackConfig: config => ({
              ...config,
              addedProperty: true,
            }),
          },
        },
      ]);
      expect(modifiedConfig).toBeDefined();
      expect(modifiedConfig).not.toBeNull();
      expect(modifiedConfig.addedProperty).toBeTruthy();
      expect(modifiedConfig.bail).toBeFalsy();
    });
  });

  describe('injectValidationMetadata', () => {
    it('should add `validationMetadata` object to vendor dll manifest', () => {
      const buildDllPath = 'build/assets/dlls';
      const vendorSourcePath = 'src/vendor.js';
      const manifestFilename = vendorDll.manifestFilename;
      const manifestPath = path.join(
        process.cwd(),
        buildDllPath,
        manifestFilename,
      );
      const vendorSource = 'import "react";';
      const reactVersion = require(path.join(process.cwd(), 'package.json'))
        .devDependencies.react;
      fs.writeFileSync(manifestPath, '{}');
      fs.writeFileSync(
        path.join(process.cwd(), vendorSourcePath),
        vendorSource,
      );

      vendorDll.injectValidationMetadata(
        getMockedConext(
          {},
          {
            buildDllPath: 'build/assets/dlls',
            vendorSourcePath,
          },
          {
            vendor: {
              entry: {
                vendor: [vendorSourcePath],
              },
            },
          },
        ),
      );

      const { validationMetadata } = JSON.parse(
        fs.readFileSync(manifestPath).toString(),
      );
      expect(validationMetadata.entryParts).toEqual([vendorSourcePath]);
      expect(validationMetadata.sourceHash).toEqual(sha1(vendorSource));
      expect(validationMetadata.dependenciesHash).toEqual(
        sha1(`react@${reactVersion}`),
      );
    });
  });

  describe('isValid', () => {
    beforeEach(() => {
      fs.unlinkSync(path.join(__dirname, 'vendor-1234.dll.js'));
      fs.unlinkSync(path.join(__dirname, 'mismatch/vendor-1234.dll.js'));
    });

    it('should return false if manifest does not exists', () => {
      const infoLogger = jest.fn();
      expect(
        vendorDll.isValid(
          getMockedConext(
            { info: infoLogger },
            { buildDllPath: 'non-exstent' },
          ),
        ),
      ).toBeFalsy();
      expect(infoLogger).toHaveBeenCalledWith(
        'Vendor DLL manifest does not exist, recompiling',
      );
    });

    it('should return false if vendor dll bundle does not exists', () => {
      const infoLogger = jest.fn();
      expect(
        vendorDll.isValid(
          getMockedConext(
            { info: infoLogger },
            { buildDllPath: path.relative(process.cwd(), __dirname) },
          ),
        ),
      ).toBeFalsy();
      expect(infoLogger).toHaveBeenCalledWith(
        'Vendor DLL bundle does not exist, recompiling',
      );
    });

    it('should return false if manifest does not have validation metadata', () => {
      const infoLogger = jest.fn();
      fs.writeFileSync(path.join(__dirname, 'vendor-1234.dll.js'), '//');
      expect(
        vendorDll.isValid(
          getMockedConext(
            { info: infoLogger },
            { buildDllPath: path.relative(process.cwd(), __dirname) },
          ),
        ),
      ).toBeFalsy();
      expect(infoLogger).toHaveBeenCalledWith(
        'Validation metadata is not defined, recompiling',
      );
    });

    it('should return false if vendor entry parts mismatch', () => {
      const infoLogger = jest.fn();
      fs.writeFileSync(
        path.join(__dirname, 'mismatch/vendor-1234.dll.js'),
        '//',
      );
      expect(
        vendorDll.isValid(
          getMockedConext(
            { info: infoLogger },
            {
              buildDllPath: path.join(
                path.relative(process.cwd(), __dirname),
                'mismatch',
              ),
            },
            {
              vendor: {
                entry: {
                  vendor: ['react', 'src/vendor.js'],
                },
              },
            },
          ),
        ),
      ).toBeFalsy();
      expect(infoLogger).toHaveBeenCalledWith(
        'Vendor DLL entry parts mismatch, recompiling',
      );
    });

    it('should return false if source hashes mismatch', () => {
      const infoLogger = jest.fn();
      const vendorSourcePath = 'src/vendor.js';
      fs.writeFileSync(
        path.join(__dirname, 'mismatch/vendor-1234.dll.js'),
        '//',
      );
      expect(
        vendorDll.isValid(
          getMockedConext(
            { info: infoLogger },
            {
              vendorSourcePath,
              buildDllPath: path.join(
                path.relative(process.cwd(), __dirname),
                'mismatch',
              ),
            },
            {
              vendor: {
                entry: {
                  vendor: ['src/vendor.js'],
                },
              },
            },
          ),
        ),
      ).toBeFalsy();
      expect(infoLogger).toHaveBeenCalledWith(
        'Vendor source hash mismatch, recompiling',
      );
    });

    it('should return false if dependencies hashes mismatch', () => {
      const infoLogger = jest.fn();
      const vendorSourcePath = 'src/vendor.js';
      fs.writeFileSync(
        path.join(__dirname, 'mismatch-deps/vendor-1234.dll.js'),
        '//',
      );
      expect(
        vendorDll.isValid(
          getMockedConext(
            { info: infoLogger },
            {
              vendorSourcePath,
              buildDllPath: path.join(
                path.relative(process.cwd(), __dirname),
                'mismatch-deps',
              ),
            },
            {
              vendor: {
                entry: {
                  vendor: ['src/vendor.js'],
                },
              },
            },
          ),
        ),
      ).toBeFalsy();
      expect(infoLogger).toHaveBeenCalledWith(
        'Vendor dependencies hash mismatch, recompiling',
      );
    });
  });
});

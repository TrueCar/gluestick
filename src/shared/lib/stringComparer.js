export default function stringComparer(accessor) {
    return (a, b) => {
        a = accessor(a);
        b = accessor(b);
        if ( a < b )
            return -1;
        if ( a > b )
            return 1;
        return 0;
    };
}


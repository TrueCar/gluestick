
export GS_CLI_BIN=$(dirname $(readlink -f $(which gluestick)))

_gluestick () 
{
  local cur
  COMPREPLY=()
  cur=${COMP_WORDS[COMP_CWORD]}

  if [ -f $GS_CLI_BIN/completion.js ]; then
    COMPREPLY=( $( compgen -W '$(node $GS_CLI_BIN/completion.js $PWD ${COMP_WORDS[@]})' -- $cur ) )
  else
    # debug
    #
    # try finding the script, then:  
    # GS_CLI_BIN=$PWD 
    # echo $'\nno gluestick completion.js available'
    return 1
  fi

  return 0
}

complete -F _gluestick gluestick

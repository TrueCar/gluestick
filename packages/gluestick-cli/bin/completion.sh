
export GS_COMP=$(dirname $(readlink -f $(which gluestick)))/../build
# dev testing:
# source completion.sh && ch ../src && GS_COMP=$PWD 

_gluestick () 
{
  local cur
  COMPREPLY=()
  cur=${COMP_WORDS[COMP_CWORD]}
  if [ -f $GS_COMP/completion.js ]; then
    COMPREPLY=( $( compgen -W '$(node $GS_COMP/completion.js $PWD ${COMP_WORDS[@]})' -- $cur ) )
  else
    # echo $'\nno gluestick completion.js available'
    return 1
  fi

  return 0
}

complete -F _gluestick gluestick

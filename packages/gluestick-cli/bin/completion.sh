
export GS_COMP=$(dirname $(readlink -f $(which gluestick)))/../build
# dev testing:
# source completion.sh && ch ../src && GS_COMP=$PWD 

_gluestick () 
{
  local cur prev
  COMPREPLY=()
  cur=${COMP_WORDS[COMP_CWORD]}
  prev=${COMP_WORDS[$(expr $COMP_CWORD - 1)]}

  if [ -f $GS_COMP/completion.js ]; then
    if [ "$prev" = "-d" -o "$prev" = "--dev" ]; then 
      compopt -o filenames
      compopt -o dirnames
      COMPREPLY=($cur*)
    else
      COMPREPLY=( $( compgen -W '$(node $GS_COMP/completion.js $PWD ${COMP_WORDS[@]})' -- $cur ) )
    fi
  else
    # echo $'\nno gluestick completion.js available'
    return 1
  fi

  return 0
}

complete -F _gluestick gluestick

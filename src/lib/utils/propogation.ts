export function stopPropogation(e: React.MouseEvent){
    e.preventDefault();
    e.stopPropagation();
}
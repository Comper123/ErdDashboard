const months = [
    'Января', 'Февраля', 'Марта', 'Апреля',
    'Мая', 'Июня', 'Июля', 'Августа',
    'Сентября', 'Октября', 'Ноября', 'Декабря'
]


export function dateToString(date: string){
    const dateToDate = new Date(date);
    const day = dateToDate.getDate().toString().padStart(2, '0');
    const month = months[dateToDate.getMonth()];
    const year = dateToDate.getFullYear();
    const hour = (dateToDate.getHours() - 3).toString().padStart(2, '0');
    const min = dateToDate.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${year}, ${hour}:${min}`
}
use std::io;


fn main() {
    let mut num_one = String::new();
    let mut num_two = String::new();

    println!("Введите первое число:");
    io::stdin()
        .read_line(&mut num_one)
        .expect("Не удалось прочитать");

    println!("Введите второе число:");
    io::stdin()
        .read_line(&mut num_two)
        .expect("Не удалось прочитать");

    match num_one.trim().parse::<f64>() {
        Ok(number1) => {
            match num_two.trim().parse::<f64>() {
                Ok(number2) => {
                    println!("Cумма: {}", number1 + number2);
                    println!("Разность: {}", number1 - number2);
                    println!("Произведение: {}", number1 * number2);
                }
                Err(_) => {
                    println!("Ошибка: Вы ввели текст или некорректные символы, а не число!");
                }
            }
        }
        Err(_) => {
            println!("Ошибка: Вы ввели текст или некорректные символы, а не число!");
        }
    }

}


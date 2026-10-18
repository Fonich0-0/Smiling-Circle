fn main() {
    let x = 5;
    
    let mut y = 6;

    println!("y было: {}", y);
    y = 67;
    println!("y стало: {}", y);

    let age: i32 = 20;
    let price: f64 = 9.99;
    let is_active: bool = true;

    // Кортеж
    let point: (i32, f64) = (10, 3.14);
    let (px, py) = point; // деструктуризация
}
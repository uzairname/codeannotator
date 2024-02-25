#include <iostream>

class Calculator {
public:
    int add(int a, int b) {
        return a + b;
    }

    int subtract(int a, int b) {
        return a - b;
    }

    int multiply(int a, int b) {
        return a * b;
    }

    double divide(int a, int b) {
        if (b == 0) {
            std::cerr << "Error: Division by zero!" << std::endl;
            return 0;
        }
        return static_cast<double>(a) / b;
    }
};

int main() {
    Calculator calc;
    int x, y;
    char operation;

    std::cout << "Enter two integers: ";
    std::cin >> x >> y;
    std::cout << "Enter an operation (+, -, *, /): ";
    std::cin >> operation;

    switch (operation) {
        case '+':
            std::cout << "Result: " << calc.add(x, y) << std::endl;
            break;
        case '-':
            std::cout << "Result: " << calc.subtract(x, y) << std::endl;
            break;
        case '*':
            std::cout << "Result: " << calc.multiply(x, y) << std::endl;
            break;
        case '/':
            std::cout << "Result: " << calc.divide(x, y) << std::endl;
            break;
        default:
            std::cout << "Invalid operation!" << std::endl;
    }

    return 0;
}

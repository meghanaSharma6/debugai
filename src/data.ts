import { LanguageProfile } from "./types";

export const LANGUAGES: LanguageProfile[] = [
  {
    id: "javascript",
    name: "JavaScript",
    ext: "js",
    icon: "⚡",
    sampleCode: `function calculateTotal(price, taxRate) {
  // Bug 1: Undefined variable assignment due to typo
  totlaPrice = price + (price * taxRate);
  
  // Bug 2: Console typo & variable reference error
  consoel.log("Calculated bill:", totla);
  
  // Bug 3: Standard JS implicit string conversion if price is a string
  return totla;
}

// Call with accidental string leading to buggy string addition
const bill = calculateTotal("100", 0.15);
console.log("Final balance:", bill);`,
    sampleError: "ReferenceError: totlaPrice is not defined\nTypeError: calculateTotal returned '1000.15' instead of numerical value."
  },
  {
    id: "typescript",
    name: "TypeScript",
    ext: "ts",
    icon: "🔷",
    sampleCode: `interface UserSession {
  id: string;
  role: "admin" | "user";
  profile?: {
    displayName: string;
    avatarUrl?: string;
  }
}

function greetSystemUser(user: UserSession): string {
  // Bug 1: Direct property access on optional sub-object 'profile' can crash
  const name = user.profile.displayName;
  
  // Bug 2: Readonly assignment or incompatible types
  if (user.role === "guest") { // Error: comparison is always false
    return "Hello " + name;
  }
  
  return \`Welcome, \${name}!\`;
}`,
    sampleError: "TypeError: Cannot read properties of undefined (reading 'displayName')\nTS2367: This comparison appears to be unintentional because the types role and guest have no overlap."
  },
  {
    id: "python",
    name: "Python",
    ext: "py",
    icon: "🐍",
    sampleCode: `def process_orders(items):
  total_discount = 0
  for item in items
      # Bug 1: Missing colon and inconsistent indentation
    price = item.get("price", 0)
    quantity = item.get("quantity")
      # Bug 2: Missing error guard for potential None or string quantity multiplication
      discount = price * quantity * 0.1
      total_discount += discount
      
   # Bug 3: Misaligned indentation for block exit
   return total_discount

print(process_orders([{"price": 50, "quantity": None}]))`,
    sampleError: "SyntaxError: invalid syntax (at line 3: for item in items)\nTypeError: unsupported operand type(s) for *: 'int' and 'NoneType'"
  },
  {
    id: "cpp",
    name: "C++",
    ext: "cpp",
    icon: "⚙️",
    sampleCode: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> numbers = {10, 20, 30};
    
    // Bug 1: Off-by-one out of bounds vector access
    for (size_t i = 0; i <= numbers.size(); ++i) {
        std::cout << "Value at " << i << ": " << numbers[i] << std::endl;
    }
    
    // Bug 2: Missing return semicolon or division by zero warning
    int divisor = 0;
    int result = 100 / divisor
    
    return 0;
}`,
    sampleError: "Segmentation fault (core dumped)\nerror: expected ';' after expression 'int result = 100 / divisor'"
  },
  {
    id: "html",
    name: "HTML/CSS",
    ext: "html",
    icon: "🌐",
    sampleCode: `<!DOCTYPE html>
<html>
<head>
  <title>User Profile Card</title>
  <style>
    .card {
      background-color: #1e293b;
      /* Bug 1: CSS typo on layout centering */
      display: flex;
      justify: center;
      align-item: center;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Meghana Kuppa</h1>
    <!-- Bug 2: Unterminated tag and invalid attribute names -->
    <img src="avatar.png" alt="Meghana" class="rounded"
  </div>
</body>
</html>`,
    sampleError: "W3C Validation Error: Unclosed div element or tag mismatch.\nCSS Warning: Ignored declaration 'justify: center' and 'align-item' (unrecognized properties)."
  }
];

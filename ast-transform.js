let parser = require("@babel/parser");
let traverse = require("babel-traverse");
let generate = require("@babel/generator");

const code = `function square(n) {
  return n * n;
}`;

// a js parser, turn code into ast
const ast = parser.parse(code);

// babel-traverse maintains the overall tree state, and is responsible for replacing, removing, and adding nodes.
traverse.default(ast, {
  enter(path) {
    // console.log(path.node.name)
    if (
      path.node.type === "Identifier" &&
      path.node.name === "n"
    ) {
      path.node.name = "x";
    }
  }
});

// Turns an AST into code.
const output = generate.default(ast, {}, code);
console.log(output)
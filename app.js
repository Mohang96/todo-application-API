const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//GET Todos API
app.get("/todos/", async (request, response) => {
  const { priority = "", status = "", search_q = "" } = request.query;
  if (priority === "" && status === "" && search_q === "") {
    //GET All Todos
    const getTodosQuery = `SELECT * FROM todo;`;
    const todosArray = await db.all(getTodosQuery);
    response.send(todosArray);
  } else if (status !== "" && priority === "" && search_q === "") {
    //GET Todos of Status "TO DO"
    const getTodosQuery = `SELECT * FROM todo WHERE status = '${status}';`;
    const todosArray = await db.all(getTodosQuery);
    response.send(todosArray);
  } else if (priority !== "" && status === "" && search_q === "") {
    //GET Todos of Priority "HIGH"
    const getTodosQuery = `SELECT * FROM todo WHERE priority = '${priority}';`;
    const todosArray = await db.all(getTodosQuery);
    response.send(todosArray);
  } else if (priority !== "" && status !== "" && search_q === "") {
    //GET Todos of Priority "HIGH" and Status "IN PROGRESS"
    const getTodosQuery = `SELECT * FROM todo WHERE priority = '${priority}' AND status = '${status}';`;
    const todosArray = await db.all(getTodosQuery);
    response.send(todosArray);
  } else if (priority === "" && status === "" && search_q !== "") {
    //GET Todos contain "Play" in todo
    const getTodosQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
    const todosArray = await db.all(getTodosQuery);
    response.send(todosArray);
  }
});

//GET Todo API
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const todo = await db.get(getTodoQuery);
  response.send(todo);
});

//ADD Todo API
app.post("/todos/", async (request, response) => {
  const { id, todo, status, priority } = request.body;
  const addTodoQuery = `INSERT INTO todo (id, todo, priority, status)
      VALUES (${id}, '${todo}', '${priority}', '${status}');`;
  await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

//UPDATE Todo API
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo = "", status = "", priority = "" } = request.body;
  if (todo === "" && status !== "" && priority === "") {
    const updateTodoQuery = `UPDATE todo SET status = '${status}' WHERE id = ${todoId};`;
    await db.run(updateTodoQuery);
    response.send("Status Updated");
  } else if (todo === "" && status === "" && priority !== "") {
    const updateTodoQuery = `UPDATE todo SET priority = '${priority}' WHERE id = ${todoId};`;
    await db.run(updateTodoQuery);
    response.send("Priority Updated");
  } else if (todo !== "" && status === "" && priority === "") {
    const updateTodoQuery = `UPDATE todo SET todo = '${todo}' WHERE id = ${todoId};`;
    await db.run(updateTodoQuery);
    response.send("Todo Updated");
  }
});

//DELETE Todo API
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;

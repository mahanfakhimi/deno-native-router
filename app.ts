import Router from "./router.ts";

const router = Router.create();

router.get("/users", async () => {
  return new Response(
    JSON.stringify(
      await fetch("https://jsonplaceholder.typicode.com/users")
        .then((res) => res.json())
        .then((users) => users)
    )
  );
});

router.get("/users/:userId", async (_req, params) => {
  return new Response(
    JSON.stringify(
      await fetch(`https://jsonplaceholder.typicode.com/users/${params.userId}`)
        .then((res) => res.json())
        .then((user) => user)
    )
  );
});

router.post("/users", async (req) => {
  return new Response(
    JSON.stringify(
      await fetch("https://jsonplaceholder.typicode.com/users", {
        method: "POST",
        body: JSON.stringify(req.body),
      })
        .then((res) => res.json())
        .then((user) => user)
    )
  );
});

Deno.serve({ port: 8080 }, async (req) => await router.route(req));

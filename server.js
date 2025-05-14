const auth = require('json-server-auth');
const jsonServer = require('json-server');

const app = jsonServer.create();
const router = jsonServer.router('user_info.json');
const middlewares = jsonServer.defaults();

app.db = router.db;

app.use(middlewares);
app.use(auth);
app.use(router);

app.listen(8000, () => {
  console.log('JSON Server with Auth running at http://localhost:8000');
});

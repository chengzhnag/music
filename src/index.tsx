import { Hono } from 'hono'
import { KVNamespace } from '@cloudflare/workers-types';
import { renderer } from './renderer'

type Bindings = {
  INFO: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(renderer)

app.get('/', (c) => {
  return c.render(<h1>Hello!</h1>)
})

app.get('/getMusic', async (c) => {
  const { cursor, limit } = c.req.query(); // 解构获取参数
  const listOptions = {
    limit: 1000,
    cursor,
    prefix: 'audio',
  };
  const { keys, list_complete, cursor: nextCursor } = await c.env.INFO.list(listOptions);

  // 根据需要获取每个键对应的值
  const items = await Promise.all(keys.reverse().map(async key => {
    const value = await c.env.INFO.get(key.name)
    return { key: key.name, value }
  }));

  return c.json({ data: items, list_complete, nextCursor });
})

app.get('/getMusic1', async (c) => {
  const listOptions = {
    prefix: 'audio',
  };
  const { keys, list_complete } = await c.env.INFO.list(listOptions);

  return c.json({ keys, list_complete });
})

app.get('/getMusic2', async (c) => {
  const listOptions = {

  };
  const { keys, list_complete } = await c.env.INFO.list(listOptions);

  return c.json({ keys, list_complete });
})

app.get('/getMusicInfoByKey', async (c) => {
  const { key } = c.req.query(); // 解构获取参数
  if (!key) {
    return c.json({ success: false, message: '请传入key' })
  }
  const data = await c.env.INFO.get(key);
  return c.json({ data });
})

export default app

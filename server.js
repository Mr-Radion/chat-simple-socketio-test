const express = require('express');
const cors = require('cors');

// Создаем экземпляр express приложения
const app = express();
// Делаем приложение вебом, с помощью http сервера
const server = require('http').Server(app);
// Добавляем к текущему веб приложению сокеты
const io = require('socket.io')(server);
// Создаем фейковвую базу данных
const rooms = new Map();
// Подключаем пакет для управления доступом в область видимости нашего приложения
app.use(cors());
// Добавляем предзапрос options для разрешений
app.options('*', cors());
// Благодаря методу .json() мы теперь сможем получать json данные по api из тела запроса req.body и т.п.
app.use(express.json());
// Добавляем возможность парсить с url запроса методом .urlencoded
// Для req.query параметра extend: true - можно брать каждое свойство запроса /?св1='значение'&св2='значение', иначе все целиком
// app.use(express.urlencoded({ extend: true }));

// по пути http://localhost:9999/rooms мы получаем данный ответ и обрабатываем его
app.get('/rooms/:id', (req, res) => {
  // Получаем данные с url запроса
  // const roomId = req.query.id;
  // Берем из переменной req.params.id само значение и переименовываем в roomId
  const { id: roomId } = req.params;

  // Если вошли в комнату, то вытаскиваем данные юзера и сообщений, иначе передаем пустые
  // Ведь при входе в /rooms каждый раз мы создаем комнату, но не входим, поэтому id нужное не получаем
  const obj = rooms.has(roomId)
    ? {
        users: [...rooms.get(roomId).get('users').values()],
        messages: [...rooms.get(roomId).get('messages').values()],
      }
    : { users: [], messages: [] };
  // Отправляем json данные на клиент в ответ от сервера на запрос клиента
  // res.send(obj);
  obj ? res.json(obj) : '';
});

app.post('/rooms', (req, res) => {
  // Получаем данные с тела запроса
  const { userName, roomId } = req.body;
  // Если среди всех комнат нет текущей введенной roomId комнаты, то мы ее создаем
  if (!rooms.has(roomId)) {
    rooms.set(
      roomId,
      new Map([
        // Добавляем в значение new Map для хранения данных, чтобы эти данные можно было корректировать удобно
        ['users', new Map()],
        // Тут сообщения будут просто хранится, поэтому не создаем new Map()
        ['messages', []],
      ]),
    );
  }
  // Возвращаем в ответе все комнаты
  res.json(...rooms.keys());
  // отправляем пустой ответ с кодом 200
  // res.send();
});

// Подключаемся на событие подключения к сокету клиента и оповещаем его об удачном подключении
io.on('connection', (socket) => {
  // Когда пользователь отправит с типом экшна ROOMS:JOIN сокет запрос, означающий, что пользователь вошел мы выполним колбэк.
  // Все что хранит пользователь хранится будет в data.
  socket.on('ROOM:JOIN', ({ roomId, userName }) => {
    // Подключаем пользователя к введенной комнате
    socket.join(roomId);
    // Получаем комнату и ключ users и туда в бд в значение помещаем то, что нам нужно
    // console.log(rooms.get(roomId).get('users').set(socket.id, userName));
    rooms.get(roomId).get('users').set(socket.id, userName);
    // Оповещаем остальных пользователей о том, что появился конкретный пользователь
    // Для этого сначала получаем всех пользователей, а точнее их имена userName в конкретной комнате
    const users = [...rooms.get(roomId).get('users').values()];
    // socket.to(roomId) - отправить номер комнаты broadcast - всем кроме меня,
    // по экшну соеденен ROOM:JOINED мы передаем данные users всех пользователей в текущей комнате, клиентам подписанным на событие
    socket.to(roomId).broadcast.emit('ROOM:SET_USERS', users);
  });

  socket.on('ROOM:NEW_MESSAGE', ({ roomId, userName, text }) => {
    const obj = {
      userName,
      text,
    };
    rooms.get(roomId).get('messages').push(obj);
    socket.to(roomId).broadcast.emit('ROOM:NEW_MESSAGES', obj);
  });

  // console.log('user connected', socket.id);
  socket.on('disconnect', () => {
    rooms.forEach((value, roomId) => {
      // Удаляем данные текущего пользователя по его socket.id при выходе, если он удалился то true и false если не нашелся и не удалился
      if (value.get('users').delete(socket.id)) {
        const users = [...value.get('users').values()];
        socket.to(roomId).broadcast.emit('ROOM:SET_USERS', users);
      }
    });
  });
});

// Подключаем сервер к порту http://localhost:9999 где localhost это http://127.0.0.1/ по сути наш ip адрес с разными путями
server.listen(9999, (err) => {
  if (err) {
    throw Error(err);
  }
  console.log('Сервер запущен!');
});

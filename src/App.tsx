import React from 'react';
import socket from './socket';
import './index.css';
import JoinBlock from './components/JoinBlock';
import Chat from './components/Chat';
import reducer from './reducer';
import axios from 'axios';

function App() {
  const [state, dispatch] = React.useReducer(reducer, {
    joined: false,
    roomId: null,
    userName: null,
    users: [],
    messages: [],
  });

  const onLogin = async (obj: any) => {
    dispatch({
      type: 'JOINED',
      payload: obj,
    });
    // Создаем событие для отправления диспатча на сервер о том, что пользователь вошел
    // И подключаемся к сокет комнате
    socket.emit('ROOM:JOIN', obj);
    // Теперь реализуем актуальную информацию для первого вошедшего при гет запросе
    // Тут вместо промисов .then и .catch мы используем деструктуризацию response от axios, а ассинхронность благодаря async и await
    const { data } = await axios.get(`/rooms/${obj.roomId}`);
    // setUsers(data.users);
    // Получение актуальных сообщений и списка юзеров при входе пользователя
    dispatch({
      type: 'SET_DATA',
      payload: data,
    });
  };

  // Одна анонимная функция с диспатчем для гет и пост запросов
  const setUsers = (users: Array<string>) => {
    // console.log('Новый пользователь', users);
    dispatch({
      type: 'SET_USERS',
      payload: users,
    });
  };

  // Функия добавляет сообщение для сокетов и для клиентского приложения в useReducer
  const addMessages = (message: any) => {
    dispatch({
      type: 'NEW_MESSAGE',
      payload: message,
    });
  };

  // Получаем с сервера актуальный список юзеров при их входе и выходе, подписываясь на события сервера
  React.useEffect(() => {
    socket.on('ROOM:SET_USERS', setUsers);
    socket.on('ROOM:NEW_MESSAGES', addMessages);
  }, []);

  // Чтобы был доступ к данным сокета глобально через консоль браузера для теста
  (window as any).socket = socket;
  // Если не авторизован то отображаю форму, иначе убираю ее
  return (
    <div className="wrapper">
      {!state.joined ? (
        <JoinBlock onLogin={onLogin} />
      ) : (
        <Chat {...state} onAddMessage={addMessages} />
      )}
    </div>
  );
}

export default App;

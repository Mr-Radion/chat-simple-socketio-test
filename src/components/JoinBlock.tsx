import React from 'react';
import axios from 'axios';

function JoinBlock({ onLogin }: any) {
  const [roomId, setRoomId] = React.useState<string>('');
  const [userName, setUserName] = React.useState<string>('');
  const [isLoading, setLoading] = React.useState<boolean>(false);

  const onEnter = async () => {
    if (!roomId || !userName) {
      return alert('Неверные данные');
    }
    setLoading(true);
    const obj = {
      roomId,
      userName,
    };
    await axios({
      method: 'post',
      url: '/rooms',
      data: obj,
    });
    // .then(onLogin);
    onLogin(obj);
  };

  return (
    <div className="join-block">
      <input
        type="text"
        placeholder="Room ID"
        value={roomId}
        onChange={(e: any) => setRoomId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Ваше имя"
        value={userName}
        onChange={(e: any) => setUserName(e.target.value)}
      />
      <button disabled={isLoading} onClick={onEnter} className="btn btn-success">
        {isLoading ? 'ВХОД...' : 'ВОЙТИ'}
      </button>
    </div>
  );
}

export default JoinBlock;

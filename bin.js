const checkSigaa = require('.');
const io = require('console-read-write');

(async () => {
  try {
    io.write('Digite seu usuário');
    const username = await io.read();

    io.write('Digite sua senha');
    const password = await io.read();

    if (!(username && password)) throw new Error('Usuário e senha necessários');

    try {
      await checkSigaa(username, password);
      console.log('Sucesso');
    } catch (err) {
      if (err.message) {
        console.log(err.message);
      } else {
        console.log('Erro');
      }
    }
    io.write('\nPressione Enter para sair');
    await io.read();
  } catch (err) {
    console.log(err.message);
  }
})();

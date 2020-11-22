module.exports = async (login, password) => {
  const puppeteer = require('puppeteer');

  const isPkg = typeof process.pkg !== 'undefined';
  const executablePath = (isPkg
    ? './chromium/chrome.exe'
    : puppeteer.executablePath()
  );

  let browser;

  try {
    browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  } catch (BrowserError) {
    try {
      browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    } catch (BrowserError) {
      console.log('Navegador não encontrado');
      console.log('Esperado chrome.exe em C:\Program Files ou (x86)\Google\Chrome\Application');
    }
  }

  const [page] = await browser.pages();
  await page.setViewport({ height: 900, width: 1600 })
  await page.goto('https://sigaa.unifei.edu.br/sigaa/verTelaLogin.do');


  await page.waitForSelector('input[name="user.login"]', {
    visible: true, hidden: false,
  });

  await page.evaluate(async ({ login, password }) => {
    const loginInput = document.querySelector('input[name="user.login"]');
    const passwordInput = document.querySelector('input[name="user.senha"]');

    loginInput.value = login;
    passwordInput.value = password;

    const loginButton = document.querySelector('input[type="submit"]');

    loginButton.click();

  }, { login, password });

  try {
    await page.waitForSelector('#avaliacao-portal table tbody tr', { timeout: 10000 });
  } catch (err) {
    throw new Error('Usuário ou senha Inválidos');
  }

  const closerDueDate = await page.evaluate(() => {
    const checkLateActivities = document.querySelectorAll('#avaliacao-portal table tbody tr td img[src="/sigaa/img/prova_semana.png"]');
    const lateActivities = [...checkLateActivities].map((lateActivity) => (
      lateActivity.parentNode.parentNode.children[1]
    ));

    const allActivitiesDueDate = lateActivities.map(({ innerText }) => (
      innerText.match(new RegExp(/\(([0-9]+ dias)\)/))[0]
    ));

    const orderedDueDates = allActivitiesDueDate.sort((a, b) => b - a);
    const closerDueDate = orderedDueDates[0];

    return closerDueDate;
  });


  if (closerDueDate) {
    await page.screenshot({ path: `${closerDueDate}.png`, type: 'png' })
  }
  await browser.close();

};
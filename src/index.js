const axios = require('axios');
const cheerio = require('cheerio');
const sendMail = require('./services/mail');

const BASE_URL = `https://sp.olx.com.br/sao-paulo-e-regiao/zona-sul?q=macbook`;

const getHtmlMainPage = async () => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error(
      'Houve um erro ao extrair os links da página principal',
      error
    );
  }
};

const createListLinks = async () => {
  const links = [];
  const html = await getHtmlMainPage();
  const $ = cheerio.load(html);
  $('[data-lurker-detail="list_id"]').each(function (i, link) {
    links[i] = $(link).attr('href');
  });

  return links;
};

const getDataSubPage = async (link) => {
  try {
    const response = await axios.get(link);
    const html = response.data;
    const $ = cheerio.load(html);
    let img = $('div.sc-28oze1-3.zSAIq > div:nth-child(1) > img').attr('src');
    let title = $('h1[tag="h1"][color="dark"]').text().trim();
    let price = $('h2[tag="h2"][color="clear"]').text().trim();
    let description = $('p [tag="span"]').text().trim();
    let publish = $(
      'div.h3us20-2.bdQAUC > div > span.sc-ifAKCX.sc-1oq8jzc-0.drrPdv'
    )
      .text()
      .trim();
    let code = $(
      'div.h3us20-2.bdQAUC > div > span.sc-ifAKCX.sc-16iz3i7-0.fxfcRz'
    )
      .text()
      .trim();

    return `
      <section>
        <h1>${title}</h1>
        <h3><small>${publish} - <strong>${code}</strong><small></h3>
        <img src="${img}" alt="${title}" width="100" style="display:block;" />
        <h3>${price}</h3>
        <p>${description}</p>
        <p>Clique <a href="${link}">Aqui</a> para ver o produtos</p>
      </section>
      <hr>
      <br />
    `;
  } catch (error) {
    console.error('Erro ao extrair dados da pagina de detalhes', error);
  }
};

const init = async () => {
  let html = '';
  const links = await createListLinks();
  for (const link of links) {
    const data = await getDataSubPage(link);
    html += data;
  }

  await sendMail(html);
  html = '';
};

init();

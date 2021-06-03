import {VK} from 'vk-io';

require('dotenv').config()
const vk = new VK({
    token: process.env.vk_token
});

let index
//функция получения постов
async function getPosts() {
    const posts = await vk.api.wall.get({
        domain: "somecompanykamui",
        count: 100,
    })
    posts.items.filter(i => {
        index = i.text.indexOf(' до ')
        if (index) {
            index += 4;
        }
    })
    return posts;
}
//функция для парсинга адреса
let adress;

async function getAdress() {
    adress = await vk.api.groups.getAddresses({
        group_id: 204425110,
        filter: "all"
    })
    return adress;
}

//работа с Telegraf
import {Telegraf} from 'telegraf'
import {text} from "telegraf/typings/button";

const bot = new Telegraf(process.env.bot_token)
bot.start((ctx) => {
    ctx.reply(`Привет ${ctx.message.from.first_name}, я чат-бот, который показывает актуальные акции Some Company, для того чтобы увидеть все мои возможности - напиши мне /help`)
})

bot.command('address', async (ctx) => {
    let adress = await getAdress()
    ctx.reply('🏢г.Москва '+ adress.items[0].address + '\n🕓Часы работы: 10:00-19:00')
})

bot.command('get', async (ctx) => {
    let postText;
    let posts = await getPosts();
    posts.items.forEach(i => {


        const dateStart = new Date(i.date * 1000)
        if (Date.parse(i.text.substring(index)) > Date.now()) {
            postText = `🔥${i.text.substring(0)}\nНачало скидки: ${dateStart}⚡️`;
            ctx.reply(postText)
        }
    })
})

bot.help(async (ctx) => {
    const helpText = 'По вопросам работы сервиса и техподдержки направляйте сообщения пользователю @kamuikori.\n' +
        'Будем рады вашим предложениям и пожеланиям!\n'+
        'ℹ️Справка по моим командам:\n'+
        '/start - команда для начала работы со мной ✅ \n' +
        '/get - получить активные акции и скидки🔥\n'+
        '/faq - посмотреть ответы на часто задаваемые вопросы❓\n'+
        '/address - получить актуальный адрес нашей компании🏢\n'+
        '/help - Вы находитесь здесь😊'
    ctx.reply(helpText)
})

bot.command('faq', async (ctx)=>{
    let text = '💭Вы находитесь только в Москве?\n'+
        '✅Да, но мы можем отправить товар в любую точку мира!\n'+
        '💭Скидки распространяются и на товар при заказе не из Москвы?\n'+
        '✅Да\n'+
        '💭Почему Вы так часто меняете адрес?\n'+
        '✅В связи с эпидемиолигческой ситуацией в стране сложно найти долговременную аренду помещения.\n'+
        '💭Зачем нужен этот бот?\n'+
        '✅Данный бот позволяет Вам узнать о актуальных скидках/акциях нашей компании, что актуально для клиентов не пользующихся Вконтакте.\n'+
        '💭Как часто проводятся акции?\n'+
        '✅Мы устраиваем акции очень часто, используйте этого чат-бота для того чтобы оставаться в курсе!\n'+
        '💭Как долго Вы занимаетесь продажами?\n'+
        '✅Мы занимаемся продажами с 2020 года\n'+
        '💭Есть ли у вас сайт?\n'+
        '✅Нет, сайт находится на стадии разработки, но Вы можете ознакомиться со всеми товарами в нашей группе Вконтакте '+ 'https://vk.com/somecompanykamui'
    ctx.reply(text)
})

bot.command('contacts', async (ctx)=>{
    let text = '☎️Телефон: +79991233344\n✉️E-mail: somecompany@yandex.ru\n📫Telegram: @kamuikori '
    ctx.reply(text)
})

let textDontKnow = "Я вас не понял, пожалуйста, воспользуйтесь командами.\nВсе команды и их описание можно получить написав мне /help ⬇️";
bot.on(("text"), (ctx =>{
    ctx.reply(textDontKnow)
}))
bot.on(("sticker"), (ctx =>{
    ctx.reply(textDontKnow)
}))

bot.launch()
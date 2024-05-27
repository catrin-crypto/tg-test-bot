require('dotenv').config();
const {Bot, GrammyError, HttpError, Keyboard, InlineKeyboard} = require('grammy'); //2 types of keyboard - custom(default in tg) and inline
const { hydrate} = require('@grammyjs/hydrate');

const bot = new Bot(process.env.BOT_API_KEY);
bot.use(hydrate());

bot.api.setMyCommands([
    {
        command: 'start', description: 'bot start',
    },
    {
        command: 'menu', description: 'get options',
    },

    {
        command: 'hello', description: 'get hi',
    },
    {
        command: 'help_me', description: 'get help',
    },
    {
        command: 'mood', description: 'select your mood',
    },
    {
        command: 'share', description: 'get kb',
    },
    {
        command: 'inline_kb', description: 'get inline kb',
    },
]);

//command answers
bot.command('start', async (ctx) => {
    await ctx.reply('Hello! Nice to meet u!', {
        reply_parameters: {message_id: ctx.msg.message_id}
    });    //answer for concrete msg
});

//keyboards for menu with callbacks & plugin "hydrate"
//instaed of hydrate editText -> await ctx.api.editMessageText(ctx.chat.id, ctx.update.callback_query.message.message_id, 'Order status..',
//    {reply_markup: backKb});
const menuKb = new InlineKeyboard().text('order status', 'order status').text('get help', 'support');
const backKb = new InlineKeyboard().text('<back to menu', 'back');
bot.command('menu', async (ctx) => {
    await ctx.reply('Choose menu option', {
        reply_markup: menuKb
    });
});

bot.callbackQuery('order status', async (ctx) => {
    await ctx.callbackQuery.message.editText('Order status: onboard', {
        reply_markup: backKb
    });
    await ctx.answerCallbackQuery();
});

bot.callbackQuery('support', async (ctx) => {
    await ctx.callbackQuery.message.editText('What happened?', {
        reply_markup: backKb
    });
    await ctx.answerCallbackQuery();
});

bot.callbackQuery('back', async (ctx) => {
    await ctx.callbackQuery.message.editText('Choose menu option', {
        reply_markup: menuKb
    });
    await ctx.answerCallbackQuery();
});
//
bot.command(['hello', 'say_smth'], async (ctx) => {
    // await ctx.reply('ok. Tg channel: [link](http://t.me/)', {
    //     parse_mode: 'MarkdownV2',
    //     disable_web_page_preview: true //disable preview of the link
    // });

    await ctx.react('❤‍🔥');
});

bot.command('inline_kb', async (ctx) => {
    const inlineKb = new InlineKeyboard().text('ok', 'btn1').text('no', 'btn2');
    await ctx.reply('Choose btn', {
        reply_markup: inlineKb
    });
});

// bot.callbackQuery(['ok', 'no'], async (ctx) => {      const inlineKb2 = new InlineKeyboard().url("Go to...", 'http://...');
//     await ctx.answerCallbackQuery('Done!');              .login  .pay
//     await ctx.reply('Good choice');
// });
bot.on('callback_query:data', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(`Good choice: ${ctx.callbackQuery.data}`);
})

bot.command(['help_me', ], async (ctx) => {
    await ctx.reply('Need help? <span class="tg-spoiler">I am BOT</span>  Tg channel: <a href="http://t.me/">link</a>', {
        parse_mode: 'HTML'
    });
});

bot.command('share', async (ctx) => {
    const shareKb = new Keyboard().requestLocation('Geoposition').requestContact('Contact')
    .requestPoll('Poll').placeholder('Make your choice').resized();
    await ctx.reply('Select smth to share', {
        reply_markup: shareKb
    });
});

bot.command('mood', async (ctx) => {
   // const moodKB = new Keyboard().text('Great!').row().text('Norm').row().text('Not bad').resized().oneTime(); // - removes kb after click
    const moodKbLabels = ['Great', 'Norm', 'Not bad'];
    const rows = moodKbLabels.map((label) => {
        return [Keyboard.text(label)]
    });
    const moodKb2 = Keyboard.from(rows).resized();

    await ctx.reply('How r u today?'
    , {
        reply_markup: moodKb2
    }
);
});

//contac management
bot.on(':contact', async (ctx ) => {
    await ctx.reply('Thanks for contact');
});

bot.hears('Great!', async (ctx) => {
    await ctx.reply('Glad to hear it!', {
        reply_markup: {remove_keyboard: true}
    });
});

bot.hears('Id', async (ctx) => {
    await ctx.reply(`${ctx.from.first_name}, your id is ${ctx.from.id} chatId is ${ctx.chat.id}`);
});

bot.hears([/fuck/, /Fuck/], async (ctx) => {  //can place regular expressions in "/../" -ignores case and other text
    await ctx.reply('Bad words(');
});

bot.on([':media', '::url'], async (ctx) => { //massive is "OR"
    await ctx.reply('Got your media or url!');
});

bot.on(':text').on('::hashtag', async (ctx) => {
    await ctx.reply('text with hashtag');
});   //on.on == AND


//msg answers
bot.hears(['ping', 'Ping'], async (ctx) => {
    await ctx.reply('pong!');
});


bot.on('message', async (ctx) => {        //  bot.on('message:text') message:photo, :voice  message:entities:url //::url  :media(photo and video) msg, edit, mention email
    await ctx.reply('You can handle it!');
});

// bot.on('msg').filter((ctx) => {   //filters
//    return ctx.from.first_name === "Катрин";
// }, async (ctx) => {
//     await ctx.reply('Hi, CatrinDev!');
// });

// console.log(ctx.message/ctx.me/ctx.from);    data from tg

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error ${ctx.update.update_id} :`);
    const e = err.error;

    if(e instanceof GrammyError){
        console.error('Error in request', e.description);
    } else if(e instanceof HttpError){
        console.error('Failed to connct with Telegram', e);
    } else {
        console.error('Unknown error', e);
    }
});

bot.start();
//deploy: new github repo - copy link; terminal: ctrl+C; git init; new file ".gitignore" -> .env; terminal -> git add
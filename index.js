require('dotenv').config({ silent: true });
const config = require('./config/variables');
const Twitter = require('twit');
const tClient = new Twitter(config);
const LanguageTranslatorV3 = require('watson-developer-cloud/language-translator/v3');
const languageTranslator = new LanguageTranslatorV3({
    version: '2017-10-13',
});
const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
const toneAnalyzer = new ToneAnalyzerV3({
    version: '2017-10-13',
});
const toneParams = {
    tone_input: '',
    content_type: 'application/json',
    accept_language: 'pt-br'
};
const stream = tClient.stream('statuses/filter', { track: '#SabadoDetremuraSDV', language: 'pt' });
stream.on('tweet', function (tweet) {
    let user = tweet.user;
    languageTranslator.translate(
    {
        text: tweet.text,
        source: 'pt',
        target: 'en'
    })
    .then(translation => {
        toneParams.tone_input = { 'text': translation.translations[0].translation };
        toneAnalyzer.tone(toneParams)
        .then(toneAnalysis => {
            if(user.location != undefined)
                console.log(`@${user.screen_name} de ${user.location} esboçou o(s) seguinte(s) teor(res) sobre o assunto:`);
            toneAnalysis.document_tone.tones.map(i=>{
                console.log(` - ${i.tone_name} <confiabilidade: ${(i.score*100).toFixed(2)}%>`);
            });

            console.log(`\n`);
        })
        .catch(err => {
            console.log('error:', err);
        });
    })
    .catch(err => {
        console.log('error:', err);
    });
});

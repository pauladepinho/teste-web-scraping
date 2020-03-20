const Nightmare = require ('nightmare');
const cheerio = require ('cheerio');
const fs = require ("fs");

const nightmare = Nightmare ({ show: true });

const url = "http://www.legislador.com.br/LegisladorWEB.ASP?WCI=";
let complementoURL = "ProjetoTramite&ID=20";
let verbete = "transporte";

let titulosEURLs = [];

pesquisar (verbete, url, complementoURL);

function pesquisar (verbete, url, complementoURL) {
    nightmare
        .goto ((url + complementoURL))
        .wait ("form > div:nth-child(3) > input")
        .click ("form > div:nth-child(3) > input")
        .type ("form > div:nth-child(3) > input", verbete)
        .click ("form > div:nth-child(4) > div > button")
        .wait (3000)
        .evaluate (() => document.querySelector ("section.container").innerHTML)
        .end ()
        .then (html => { 
            getTitulosEURLs (html);
            salvarJSON ();
        })
        .catch (err => {
            console.log (err);
        })
}

function getTitulosEURLs (html) {
    const $ = cheerio.load (html);

    let urls = [];
    let argsDasURLs = [];

    // pegando os títulos
    $ ("div.card-header > h5").each ((i, element) => {
        titulosEURLs.push ({
            titulo: $ (element).text (),
            url: ""
        })
    })

    // pegando os argumentos que serão passados às URLs
    $ ("div.card-body > a").each ((i, element) => {
        argsDasURLs.push (element.attribs.onclick);
    });
    for (var i in argsDasURLs) {
        argsDasURLs [i] = argsDasURLs [i].slice ((argsDasURLs [i].indexOf ("(") + 1), argsDasURLs [i].indexOf (")"));
        argsDasURLs [i] = argsDasURLs [i].split (","); // formando array de arrays
    }

    // formando as URLs (let url + seus argumentos)
    for (var i in argsDasURLs) {
        let [argID, argINEspecie, argNRProjeto, argAAProjeto] = argsDasURLs [i]
        complementoURL = `ProjetoTexto&ID=${argID}&inEspecie=${argINEspecie}&nrProjeto=${argNRProjeto}&aaProjeto=${argAAProjeto}`
        urls.push (url + complementoURL);
    }

    // colocando as urls com os títulos
    for (var i in titulosEURLs) {
        titulosEURLs [i].url = urls [i];
    }

    return titulosEURLs;
}

function salvarJSON () {
    fs.writeFile ('titulosEURLs.json', JSON.stringify (titulosEURLs), function (err) {
        if (err) {
            console.log (err);
        } else {
            console.log ("success");
        }
    });
}
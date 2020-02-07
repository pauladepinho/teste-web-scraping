const Nightmare = require('nightmare');
const vo = require ("vo");
const cheerio = require('cheerio');
const fs = require ("fs");

const titulosEURLs = require ("./titulosEURLs.json");
let resultado = [];

vo (run) (function (err, htmls) {
    if (err) throw err;
    htmls.forEach (html => resultado.push ( getData (html) ));
    adicionarTitulo ();
    salvarJSON ();
});

function * run () { // retorna array com parte do html de cada página
    let nightmare = Nightmare({ show: true });
    let htmls = [];
    
    for (var i in titulosEURLs) {
        htmls.push (yield nightmare
            .goto (titulosEURLs [i].url)
            .wait ("body > section > div")
            .evaluate (() => document.querySelector ("body > section > div").innerHTML)
        );
    }

    yield nightmare.end ();
    return htmls;
}

function getData (html) {
    let $ = cheerio.load (html);

    let tramite = [];

    $ ("#idTramite > table > tbody > tr").each ((i, element) => {
        tramite.push ({
            projeto: $ (element).find ("td:nth-child(1) > dl > dt").text ().trim (),
            entrada: $ (element).find ("td:nth-child(2)").text ().trim (),
            prazo: $ (element).find ("td:nth-child(3)").text ().trim (),
            devolucao: $ (element).find ("td:nth-child(4)").text (). trim ()
        });
    });

    return {
        titulo: "", // usar função para pegar título sem o "     Ocultar Trâmite" junto
        data: $ ("div.col-lg > dl > dd:nth-child(4)").text ().trim (),
        situacao: $ ("div.col-lg > dl > dd:nth-child(2)").text ().trim (),
        assunto: $ ("div.col-lg > dl > dd:nth-child(8)").text ().trim (),
        autor:  $ ("div.col-lg > dl > dd:nth-child(10)").text ().trim (),
        ementa: $ ("div:nth-child(5) > p").text ().trim (),
        // Trâmite do Projeto (Projeto, Entrada, Prazo, Devolução)
        tramite
    };
}

function adicionarTitulo () {
    for (var i in resultado) {
        resultado [i].titulo = titulosEURLs [i].titulo;
    }

    return resultado;
}

function salvarJSON () {
    fs.writeFile ('resultadoDaPesquisa.json', JSON.stringify (resultado), function (err) {
        if(err) {
            console.log(err);
        } else {
            console.log("success");
        }
    });
}
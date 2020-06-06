const express = require("express")
const server = express()

//pegar o banco de dados
const db = require("./database/db.js")

//configurar pasta pública
server.use(express.static("public"))

// habilitar o uso deo req.body na nossa aplicação
server.use(express.urlencoded({ extended: true }))

// utilizando template engine (nunjucks)
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCache: true
})

//nunjucks torna o html mais dinâmico, podendo usar funções e bla bla dentro dele

// configurar caminhos da minha aplicação
// página inicial
//req: requisição , um pedido
//res: resposta
server.get("/", (req, res) => {
   return res.render("index.html") //dirname é o nome do diretório que eu estou
})

server.get("/create-point", (req, res) => {

    //req.body: corpo do nosso formulário
    // req.query: Query Strings da nossa url
    //console.log(req.body)
    return res.render("create-point.html") 
})

server.post("/savepoint", (req, res) => {

// inserir dados no banco de dados

    const query = `
        INSERT INTO places (
            image,
            name,
            address,
            address2,
            state,
            city,
            items
        ) VALUES ( ?, ?, ?, ?, ?, ?, ?);
    `

    const values = [ 
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items
       ]

    function afterInsertData(err) {
        if(err) {
            return console.log(err)
        }

        console.log("Cadastrado com sucesso")
        console.log(this)
   
    return res.render("create-point.html", {saved: true})
}
    db.run(query, values, afterInsertData)
   
})

server.get("/search", (req, res) => {

    const search = req.query.search
    if(search == "") {
        // pesquisa vazia
        return res.render("search-results.html", { total: 0 })
}

    // pegar os dados do banco de dados
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function(err, rows){
        if(err) {
            console.log(err)
            return res.send("Erro no cadastro!")
        }

        // mostrar a página html com os dados do banco de dados
        const total = rows.length

        return res.render("search-results.html", { places: rows, total}) 
    })    
})

// ligar o servidor
server.listen(3000)

// nodemon para ficar monitorando qualquer alteração no servidor e atualizar sozinho sem precisar desligar o server

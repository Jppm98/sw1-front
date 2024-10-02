const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
//referencia a la base de datos
const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');
const fs = require('fs');
const path = require('path'); // Importa el módulo 'path' para manejar rutas
const xml2js = require('xml2js');


router.get('/add', isLoggedIn, (req, res) => {
    //renderizar
    res.render('salas/add');
});

router.post('/add', isLoggedIn, async (req, res) => {
    const { title, xml, description } = req.body;
    const newSalas = {
        title,
        xml,
        description,
        user_id: req.user.id
    };
    const token = jwt.sign({ newSalas }, 'token_sala');
    console.log(token);
    newSalas.tokenS = token;
    const sala = await pool.query('INSERT INTO salas set ?', [newSalas]);
    console.log(sala);
    newSalas.id = sala.insertId;
    console.log(newSalas.id);
    const newUS = {
        user_id: req.user.id,
        salas_id: newSalas.id
    };
    await pool.query('INSERT INTO usersalas set ?', [newUS]);
    //mensajes nombre del mensaje
    req.flash('success', 'Salas guardada Successfully');
    res.redirect('/salas');
    
});

router.get('/', isLoggedIn, async (req, res) => {
    const salas = await pool.query('SELECT * FROM salas where user_id = ?', [req.user.id]);
    res.render('salas/list', { salas });
});

router.get('/salasCompartidas', isLoggedIn, async (req, res) => {
    const idUs = req.user.id;
    console.log(idUs + 'id usuario');
    const salas = await pool.query('SELECT * from salas where id in ( SELECT usersalas.salas_id from usersalas where user_id = ?)', [req.user.id]);
    console.log(salas);
    res.render('salas/listCompartidas', { salas });
});

router.get('/delete/:id', async (req, res) => {
    console.log(req.params.id);
    const { id } = req.params;
    //agregar seguridad al eliminar
    await pool.query('DELETE FROM usersalas WHERE salas_id = ?', [id]);
    await pool.query('DELETE FROM salas WHERE ID = ?', [id]);
    req.flash('success', 'Sala eliminada de la base de datos');
    res.redirect('/salas');
});

router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const salas = await pool.query('SELECT * FROM salas WHERE id = ?', [id]);
    console.log(salas);
    res.render('salas/edit', { sala: salas[0] });
});

router.post('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { title, description, xml } = req.body;
    const newSala = {
        title,
        description,
        xml
    };
    await pool.query('UPDATE salas set ? WHERE id = ?', [newSala, id]);
    req.flash('success', 'Sala actualizada');
    res.redirect('/salas');
});

router.get('/inSala/:tokenS', isLoggedIn, async (req, res) => {
    const tokenU = req.user.tokenU;
    console.log(tokenU + 'token de usuario');
    const { tokenS } = req.params;
    console.log(req.params + ' requ parametros');
    const inSala = '?room=' + tokenS;
    const inUs = '&username=' + tokenU;
    const xml = 'http://localhost:8080/model-c4' + inSala + inUs;
    console.log(xml);
    res.redirect(xml);
});

router.get('/listUsuarios/:idSala', isLoggedIn, async (req, res, idS) => {
    const { idSala } = req.params;

    const users = await pool.query('SELECT * FROM users');
    console.log(users);
    console.log(idSala + 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    idS = idSala;
    res.render('salas/listUsuarios', { users, idSala });
});


router.post('/compartir/:idSala', isLoggedIn, async (req, res,) => {
    console.log('hola');
    console.log(req.body);
    const { idUsuario } = req.body;
    const { idSala } = req.params;

    console.log(idUsuario + 'id del usuario');
    console.log(idSala + ' id de las sala');
    const newUS = {
        user_id: idUsuario,
        salas_id: idSala
    };
    console.log('newUS');
    await pool.query('INSERT INTO usersalas set ?', [newUS]);
    req.flash('success', 'Compartido Successfully');
    res.redirect('/salas');
});

    router.get('/exportar/:id', isLoggedIn, async (req, res) => {
        try {
          const { id } = req.params;
          const salas = await pool.query('SELECT * FROM salas WHERE id = ?', [id]);
      
          // Obtiene el contenido XML de 'salas[0].xml'
          const xmlContent = salas[0].xml;
      
          const parseXml = (xmlString) => {
            return new Promise((resolve, reject) => {
              const parser = new xml2js.Parser();
              parser.parseString(xmlString, (err, result) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(result);
                }
              });
            });
          };
      
          // Ahora parseamos el XML en un objeto JSON
          const json = await parseXml(xmlContent);
      
   
          const jsonn = JSON.stringify(json, null, 2);



var objeto = JSON.parse(jsonn);
const javaCode = await convertJsonToRuby(jsonn);
console.log(javaCode);

      
          res.render('salas/exportar', { javaCode, sala: salas[0] });
        } catch (error) {
          console.error(error);
          res.status(500).send('Error interno del servidor');
        }
      });

      function convertJsonToRuby(json) {
        // Convertir el JSON a un objeto JavaScript.
        const jsonObject = JSON.parse(json);
      
        // Generar el código Ruby.
        let rubyCode = '';
        for (const key in jsonObject) {
          if (jsonObject.hasOwnProperty(key)) {
            const value = jsonObject[key];
      
            if (typeof value === 'object') {
              // Si el valor es un objeto, recursivamente convertirlo a código Ruby.
              rubyCode += convertJsonToRuby(JSON.stringify(value));
            } else {
              // Si el valor no es un objeto, simplemente agregarlo al código Ruby.
              rubyCode += `${key}: ${value},\n`;
            }
          }
        }
      
        // Retornar el código Ruby generado.
        return rubyCode;
      }
      


      function jsonToPhpCode(json) {
        // Obtener la raíz del modelo mxGraph
        const root = json.mxGraphModel.root;
      
        // Crear una cadena de código PHP
        let phpCode = `<?php\n\n`;
      
        // Recorrer los elementos de la raíz
        for (const element of root) {
          // Obtener el identificador del elemento
          const id = element.mxCell[0].$;
      
          // Obtener el valor del elemento
          const value = element.mxCell[0].$.value;
      
          // Obtener el estilo del elemento
          const style = element.mxCell[0].$.style;
      
          // Crear una clase PHP para el elemento
          phpCode += `class ${id} {\n`;
      
          // Agregar las propiedades del elemento a la clase
          phpCode += `  public $value = '${value}';\n`;
          phpCode += `  public $style = '${style}';\n`;
      
          // Cerrar la clase
          phpCode += `}\n\n`;
        }
      
        // Agregar una función para crear una instancia del elemento
        phpCode += `function create${id}() {\n`;
        phpCode += `  return new ${id}();\n`;
        phpCode += `}\n\n`;
      
        // Cerrar el archivo PHP
        phpCode += `?>`;
      
        // Devolver el código PHP
        return phpCode;
      }
  
module.exports = router;
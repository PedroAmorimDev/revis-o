import http from 'node:http';
import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';

const filePath = 'data.json';

const server = http.createServer((request, response) => {
    const { method, url } = request;

    if (method === 'GET' && url === '/dados') {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                response.writeHead(500, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ message: 'Não foi possível acessar a base de dados' }));
                return;
            }
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(data);
        });
    } else if (method === 'POST' && url === '/dados') {
        let body = '';
        request.on('data', (chunk) => {
            body += chunk;
        });
        request.on('end', () => {
            const novoDado = JSON.parse(body);
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    response.writeHead(500, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ message: 'Não foi possível acessar a base de dados' }));
                    return;
                }

                const dados = JSON.parse(data);

                novoDado.id = uuidv4();
                dados.push(novoDado);

                fs.writeFile(filePath, JSON.stringify(dados, null, 2), (err) => {
                    if (err) {
                        response.writeHead(500, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify({ message: 'Não foi possível salvar o dado' }));
                        return;
                    }
                    response.writeHead(201, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify(novoDado));
                });
            });
        });
    } else if (method === 'PUT' && url.startsWith('/dados/')) {
        const id = url.split('/')[2];
        let body = '';
        request.on('data', (chunk) => {
            body += chunk;
        });
        request.on('end', () => {
            const dadoAtualizado = JSON.parse(body);
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    response.writeHead(500, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ message: 'Não foi possível acessar a base de dados' }));
                    return;
                }

                const dados = JSON.parse(data);
                const index = dados.findIndex(d => d.id === id);
                if (index !== -1) {
                    dados[index] = { ...dados[index], ...dadoAtualizado };
                    fs.writeFile(filePath, JSON.stringify(dados, null, 2), (err) => {
                        if (err) {
                            response.writeHead(500, { 'Content-Type': 'application/json' });
                            response.end(JSON.stringify({ message: 'Não foi possível atualizar o dado' }));
                            return;
                        }
                        response.writeHead(200, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify(dados[index]));
                    });
                } else {
                    response.writeHead(404, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ message: 'Dado não encontrado' }));
                }
            });
        });
    } else if (method === 'DELETE' && url.startsWith('/dados/')) {
        const id = url.split('/')[2];
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                response.writeHead(500, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ message: 'Não foi possível acessar a base de dados' }));
                return;
            }

            const dados = JSON.parse(data);
            const index = dados.findIndex(d => d.id === id);
            if (index !== -1) {
                dados.splice(index, 1);
                fs.writeFile(filePath, JSON.stringify(dados, null, 2), (err) => {
                    if (err) {
                        response.writeHead(500, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify({ message: 'Não foi possível deletar o dado' }));
                        return;
                    }
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ message: 'Dado deletado com sucesso' }));
                });
            } else {
                response.writeHead(404, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ message: 'Dado não encontrado' }));
            }
        });
    } else {
        response.writeHead(404, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: 'Página não encontrada' }));
    }
});

server.listen(8000, () => {
    console.log('Servidor on http://localhost:8000');
});

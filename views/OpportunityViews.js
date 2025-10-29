
class OpportunityView{ 
  
static createSoldOppEmail = (opportunity, user, clientName) => {
    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    const rows = [
        {
          label: 'Projeto', data: `${opportunity.idProjeto}.${opportunity.numeroAdicional} - ${opportunity.descricao || opportunity.nome}` 
        },
        {
          label: 'Valor Faturamento Direto', data: formatter.format(Number(opportunity.valorFatDireto))
        },
        {
          label: 'Valor Faturamento Dolphin', data: formatter.format(Number(opportunity.valorFatDolphin)) 
        },
        {
          label: 'Valor Total', data: formatter.format(Number(opportunity.valorFatDolphin) + Number(opportunity.valorFatDireto) )
        }
    ];
    console.log('rows', rows);
    const currentDateTime = new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(',', '');

    return `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        h2 {
          margin-top: 0;
          font-weight: normal;
        }
        
        p {
          margin-bottom: 20px;
        }
        
        .project-details {
          margin-top: 20px;
          border-collapse: collapse;
          width: 100%;
        }
        
        .project-details th,
        .project-details td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        .project-details th {
          background-color: #f9f9f9;
        }
        
        .login-info {
          font-size: small;
        }
      </style>
      <title>Email de Venda do Projeto</title>
    </head>
    <body>
      <div class="container">
        <h2>Cliente: ${clientName || 'N/A'}</h2>
        <table class="project-details"> 
          ${rows.map(row => `
            <tr>
              <th>${row.label}</th>
              <td>${row.data}</td>
            </tr>
          `).join('')}
        </table>
        
        <p>Descrição da venda:</p>
        <p>${opportunity.descricaoVenda || 'Sem descrição'}</p>
        <p class="login-info">Login: ${user.NOME || 'N/A'} - Data: ${currentDateTime}</p>
      </div>
    </body>
    </html>
  `;
}
}

module.exports = OpportunityView;
document.addEventListener("DOMContentLoaded", function () {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const outputData = document.getElementById("outputData");
  const context = canvas.getContext("2d");

  // Campos do formulário de cadastro
  const nomeField = document.getElementById("nome");
  const identificacaoField = document.getElementById("identificacao");
  const veiculoField = document.getElementById("veiculo");

  // Arrays para armazenar as informações lidas
  const nomes = [];
  const identificacoes = [];
  const veiculos = [];

  // Função para acessar a câmera
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then(function (stream) {
      video.srcObject = stream;
      video.setAttribute("playsinline", true); // Para que o vídeo não seja executado em tela cheia no iPhone
      video.play();
      requestAnimationFrame(tick);
    })
    .catch(function (err) {
      console.error("Erro ao acessar a câmera: " + err);
    });

  function tick() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.hidden = false;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        try {
          // Tenta converter os dados do QR code para um objeto JSON
          const qrData = JSON.parse(code.data);

          // Verifica se as informações já foram armazenadas
          if (
            !nomes.includes(qrData.name) &&
            !identificacoes.includes(qrData.identification) &&
            !veiculos.includes(qrData.vehicle)
          ) {
            // Armazena os novos dados nos arrays
            nomes.push(qrData.name);
            identificacoes.push(qrData.identification);
            veiculos.push(qrData.vehicle);

            // Preenche os campos do formulário com os dados do QR code
            nomeField.value = qrData.name || "";
            identificacaoField.value = qrData.identification || "";
            veiculoField.value = qrData.vehicle || "";

            // Atualiza a interface para mostrar os dados lidos
            outputData.innerText = "Dados preenchidos automaticamente.";
          } else {
            outputData.innerText = "Código já lido.";
          }

          // Desenha o retângulo em volta do QR code
          drawLine(
            code.location.topLeftCorner,
            code.location.topRightCorner,
            "#FF3B58"
          );
          drawLine(
            code.location.topRightCorner,
            code.location.bottomRightCorner,
            "#FF3B58"
          );
          drawLine(
            code.location.bottomRightCorner,
            code.location.bottomLeftCorner,
            "#FF3B58"
          );
          drawLine(
            code.location.bottomLeftCorner,
            code.location.topLeftCorner,
            "#FF3B58"
          );
        } catch (e) {
          outputData.innerText = "Formato de QR code inválido.";
        }
      } else {
        outputData.innerText = "Aponte para um QR code";
      }
    }
    requestAnimationFrame(tick);
  }

  // Função para desenhar uma linha
  function drawLine(begin, end, color) {
    context.beginPath();
    context.moveTo(begin.x, begin.y);
    context.lineTo(end.x, end.y);
    context.lineWidth = 4;
    context.strokeStyle = color;
    context.stroke();
  }
});

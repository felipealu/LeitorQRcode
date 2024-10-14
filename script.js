document.addEventListener('DOMContentLoaded', function() {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const outputData = document.getElementById('outputData');
  const context = canvas.getContext('2d');
  const detectedCodes = []; // Array para armazenar os códigos lidos

  // Função para acessar a câmera
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(function(stream) {
      video.srcObject = stream;
      video.setAttribute("playsinline", true); // Para que o vídeo não seja executado em tela cheia no iPhone
      video.play();
      requestAnimationFrame(tick);
    })
    .catch(function(err) {
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
        // Verifica se o código já foi lido
        if (!detectedCodes.includes(code.data)) {
          detectedCodes.push(code.data); // Armazena o novo código
          displayDetectedCodes(); // Atualiza a exibição dos códigos
        }
        // Desenha o retângulo em volta do QR code
        drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
        drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
        drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
        drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
      } else {
        outputData.innerText = "Aponte para um QR code";
      }
    }
    requestAnimationFrame(tick);
  }

  function drawLine(begin, end, color) {
    context.beginPath();
    context.moveTo(begin.x, begin.y);
    context.lineTo(end.x, end.y);
    context.lineWidth = 4;
    context.strokeStyle = color;
    context.stroke();
  }

  // Função para exibir os códigos lidos na tela
  function displayDetectedCodes() {
    outputData.innerHTML = ''; // Limpa a exibição atual
    detectedCodes.forEach((code, index) => {
      const listItem = document.createElement('div');
      listItem.textContent = `Código ${index + 1}: ${code}`;
      outputData.appendChild(listItem);
    });
  }
});

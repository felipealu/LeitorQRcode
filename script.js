document.addEventListener('DOMContentLoaded', function() {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const outputData = document.getElementById('outputData');
  const context = canvas.getContext('2d');

  // Arrays para armazenar as informações detectadas
  const names = [];
  const identifications = [];
  const vehicles = [];

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
        try {
          // Tenta converter os dados do QR code para um objeto JSON
          const qrData = JSON.parse(code.data);

          // Verifica se as informações já foram armazenadas
          if (!names.includes(qrData.name) && !identifications.includes(qrData.identification) && !vehicles.includes(qrData.vehicle)) {
            // Adiciona as novas informações nos arrays
            names.push(qrData.name);
            identifications.push(qrData.identification);
            vehicles.push(qrData.vehicle);

            // Atualiza a interface para mostrar os dados armazenados
            displayStoredData();
          } else {
            outputData.innerText = "Código já lido.";
          }

          // Desenha o retângulo em volta do QR code
          drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
          drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
          drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
          drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
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

  // Função para mostrar os dados armazenados na tela
  function displayStoredData() {
    outputData.innerHTML = "<h3>Informações Armazenadas:</h3>";
    for (let i = 0; i < names.length; i++) {
      outputData.innerHTML += `<p><strong>Nome:</strong> ${names[i]}</p>`;
      outputData.innerHTML += `<p><strong>Identificação:</strong> ${identifications[i]}</p>`;
      outputData.innerHTML += `<p><strong>Veículo/Placa:</strong> ${vehicles[i]}</p>`;
      outputData.innerHTML += "<hr>";
    }
  }
});

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const canvasDownload = document.getElementById("canvasDownload");
const ctxDownload = canvasDownload.getContext("2d");

let greenSlots = [];
let bannerImage = new Image();

// carica banner (vere dimensioni)
function loadBanner(){
  let id = parseInt(document.getElementById("tokenId").value);
  if(isNaN(id) || id < 1 || id > 2400){
    alert("Token ID must be between 1 and 2400");
    return;
  }

  bannerImage.src = `images/${id}.png`;
  bannerImage.onload = function(){
    // disegna sul canvas reale
    ctxDownload.clearRect(0,0,canvasDownload.width,canvasDownload.height);
    ctxDownload.drawImage(bannerImage,0,0);

    // aggiorna canvas visuale
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(canvasDownload,0,0);

    detectGreenSquares();
  }
}

// trova i quadratini verdi
function detectGreenSquares(){
  greenSlots = [];
  const data = ctxDownload.getImageData(0,0,canvasDownload.width,canvasDownload.height).data;

  for(let y=0;y<canvasDownload.height;y+=96){
    for(let x=0;x<canvasDownload.width;x+=96){
      let idx = (y*canvasDownload.width + x)*4;
      if(data[idx] === 0 && data[idx+1] === 255 && data[idx+2] === 30){
        greenSlots.push({x,y});
      }
    }
  }
  createUploadInputs();
}

// crea grid input + anteprime
function createUploadInputs(){
  const area = document.getElementById("uploadArea");
  area.innerHTML = "";

  greenSlots.forEach((slot,i) => {

    let container = document.createElement("div");

    // anteprima quadratino verde
    let preview = document.createElement("div");
    preview.className = "slotPreview";
    preview.style.background = "#00FF1E"; 

    // pulsante upload
    let label = document.createElement("p");
    label.innerText = "Slot #" + (i+1);

    let input = document.createElement("input");
    input.type = "file";

    input.onchange = (e) => {
      let file = e.target.files[0];
      let reader = new FileReader();

      reader.onload = function(ev){
        let img = new Image();
        img.onload = function(){
          // ridimensiona e disegna sul canvas reale
          ctxDownload.drawImage(img, slot.x, slot.y, 96, 96);

          // aggiorna preview canvas visuale
          ctx.clearRect(0,0,canvas.width,canvas.height);
          ctx.drawImage(canvasDownload,0,0);
        }
        img.src = ev.target.result;
      }
      reader.readAsDataURL(file);
    };

    container.appendChild(preview);
    container.appendChild(label);
    container.appendChild(input);
    area.appendChild(container);
  });
}

// scarica PNG finale
function downloadBanner(){
  let link = document.createElement("a");
  link.download = "worldwebwindows.png";
  link.href = canvasDownload.toDataURL();
  link.click();
}

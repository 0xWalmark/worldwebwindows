const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const canvasDownload = document.getElementById("canvasDownload");
const ctxDownload = canvasDownload.getContext("2d");

let greenSlots = [];
let bannerImage = new Image();
let currentToken = 0;

// Carica banner selezionato
function loadBanner(){
  let id = parseInt(document.getElementById("tokenId").value);
  if(isNaN(id) || id < 1 || id > 2400){
    alert("Token ID must be between 1 and 2400");
    return;
  }
  currentToken = id;

  bannerImage = new Image();
  bannerImage.onload = function(){
    // Disegna su canvas reale
    ctxDownload.clearRect(0,0,canvasDownload.width,canvasDownload.height);
    ctxDownload.drawImage(bannerImage,0,0);

    // Aggiorna canvas visualizzato (ridimensionato con CSS)
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(canvasDownload,0,0);

    detectGreenSquares();
  };
  bannerImage.src = "images/"+id+".png";
}

// Rileva quadrati verdi
function detectGreenSquares(){
  greenSlots = [];
  let imageData = ctxDownload.getImageData(0,0,canvasDownload.width,canvasDownload.height);
  let data = imageData.data;

  for(let y=0;y<canvasDownload.height;y+=96){
    for(let x=0;x<canvasDownload.width;x+=96){
      let index = (y*canvasDownload.width + x) * 4;
      let r = data[index];
      let g = data[index+1];
      let b = data[index+2];

      if(r===0 && g===255 && b===30){
        greenSlots.push({x,y});
      }
    }
  }
  createUploadInputs();
}

// Crea pulsanti upload in griglia
function createUploadInputs() {
  let area = document.getElementById("uploadArea");
  area.innerHTML = "";

  greenSlots.forEach((slot,i)=>{
    let container = document.createElement("div");

    let label = document.createElement("p");
    label.innerText = "Slot "+(i+1);

    let input = document.createElement("input");
    input.type = "file";

    input.onchange = (e)=>{
      let file = e.target.files[0];
      let reader = new FileReader();
      reader.onload=function(ev){
        let img = new Image();
        img.onload = function(){
          // Disegna sul canvas reale
          ctxDownload.drawImage(img, slot.x, slot.y, 96, 96);
          // Aggiorna canvas visualizzato scalato
          ctx.clearRect(0,0,canvas.width,canvas.height);
          ctx.drawImage(canvasDownload,0,0);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };

    container.appendChild(label);
    container.appendChild(input);
    area.appendChild(container);
  });
}

// Scarica banner finale
function downloadBanner(){
  let link = document.createElement("a");
  link.download = "worldwebwindows.png";
  link.href = canvasDownload.toDataURL();
  link.click();
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const canvasDownload = document.getElementById("canvasDownload");
const ctxDownload = canvasDownload.getContext("2d");

let greenSlots = [];
let bannerImage = new Image();
let currentToken = 0;

// carica banner selezionato
function loadBanner(){
  let id = parseInt(document.getElementById("tokenId").value);
  if(isNaN(id) || id < 1 || id > 2400){
    alert("Token ID must be between 1 and 2400");
    return;
  }
  currentToken = id;

  bannerImage = new Image();
  bannerImage.onload = function(){
    // canvas visualizzato
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(bannerImage,0,0);

    // canvas download (reale)
    ctxDownload.clearRect(0,0,canvasDownload.width,canvasDownload.height);
    ctxDownload.drawImage(bannerImage,0,0);

    detectGreenSquares();
  };
  bannerImage.src = "images/"+id+".png";
}

// trova quadrati verdi 96x96
function detectGreenSquares(){
  greenSlots = [];
  let imageData = ctxDownload.getImageData(0,0,canvas.width,canvas.height);
  let data = imageData.data;

  for(let y=0;y<canvas.height;y+=96){
    for(let x=0;x<canvas.width;x+=96){
      let index = (y*canvas.width + x) * 4;
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

// crea pulsanti upload in griglia
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
          // disegna sia su canvas visualizzato che download
          ctx.clearRect(slot.x, slot.y, 96, 96);
          ctx.drawImage(img, slot.x, slot.y, 96, 96);
          ctxDownload.drawImage(img, slot.x, slot.y, 96, 96);
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

// scarica banner finale
function downloadBanner(){
  let link = document.createElement("a");
  link.download = "worldwebwindows.png";
  link.href = canvasDownload.toDataURL();
  link.click();
}

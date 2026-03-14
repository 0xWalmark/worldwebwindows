const canvasReal = document.getElementById("canvasReal");
const ctxReal = canvasReal.getContext("2d");

let greenSlots = [];
let bannerImage = new Image();

const uploadArea = document.getElementById("uploadArea");
const easterEggMsg = document.getElementById("easterEggMsg");

// Carica banner
function loadBanner(){
  let id = parseInt(document.getElementById("tokenId").value);

  // Easter Egg token 2401
  if(id === 2401){
    easterEggMsg.innerText = "World Web Windows are half the story.\nNext part coming for holders soon.";
    ctxReal.clearRect(0,0,canvasReal.width,canvasReal.height);
    uploadArea.innerHTML = "";
    return;
  } else {
    easterEggMsg.innerText = "";
  }

  if(isNaN(id) || id < 1 || id > 2400){
    alert("Token ID must be between 1 and 2400");
    return;
  }

  bannerImage.src = `images/${id}.png`;
  bannerImage.onload = function(){
    ctxReal.clearRect(0,0,canvasReal.width,canvasReal.height);
    ctxReal.drawImage(bannerImage,0,0);
    detectGreenSquares();
  }
}

// Trova quadrati verdi
function detectGreenSquares(){
  greenSlots = [];
  const data = ctxReal.getImageData(0,0,canvasReal.width,canvasReal.height).data;

  for(let y=0;y<canvasReal.height;y+=96){
    for(let x=0;x<canvasReal.width;x+=96){
      let idx = (y*canvasReal.width + x)*4;
      if(data[idx]===0 && data[idx+1]===255 && data[idx+2]===30){
        greenSlots.push({x,y});
      }
    }
  }
  createUploadInputs();
}

// Crea pulsanti upload + anteprime
function createUploadInputs(){
  uploadArea.innerHTML = "";

  greenSlots.forEach((slot,i)=>{
    let container = document.createElement("div");

    // Anteprima sopra il pulsante
    let preview = document.createElement("div");
    preview.className = "slotPreview";

    // Label Slot #
    let label = document.createElement("p");
    label.innerText = "Slot #" + (i+1);

    // Pulsante Choose File
    let input = document.createElement("input");
    input.type = "file";

    input.onchange = (e)=>{
      let file = e.target.files[0];
      let reader = new FileReader();
      reader.onload = function(ev){
        let img = new Image();
        img.onload = function(){
          // Disegna sul canvas reale dimensione 96x96
          ctxReal.drawImage(img, slot.x, slot.y, 96, 96);
        }
        img.src = ev.target.result;
      }
      reader.readAsDataURL(file);
    }

    container.appendChild(preview);
    container.appendChild(label);
    container.appendChild(input);
    uploadArea.appendChild(container);
  });
}

// Download banner
function downloadBanner(){
  const link = document.createElement("a");
  link.download = "worldwebwindows.png";
  link.href = canvasReal.toDataURL();
  link.click();
}

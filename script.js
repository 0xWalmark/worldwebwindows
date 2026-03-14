const canvasReal = document.getElementById("canvasReal");
const ctxReal = canvasReal.getContext("2d");

const canvasView = document.getElementById("canvasView");
const ctxView = canvasView.getContext("2d");

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
    ctxView.clearRect(0,0,canvasView.width,canvasView.height);
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
    updateCanvasView();
  }
}

// Aggiorna canvas visuale scalato senza scroll
function updateCanvasView(){
  const scale = Math.min(canvasView.parentElement.clientWidth / canvasReal.width, 1);
  canvasView.width = canvasReal.width * scale;
  canvasView.height = canvasReal.height * scale;
  ctxView.clearRect(0,0,canvasView.width,canvasView.height);
  ctxView.drawImage(canvasReal,0,0,canvasView.width,canvasView.height);
}

// Trova quadrati verdi in ordine corretto (x crescente, y crescente)
function detectGreenSquares(){
  greenSlots = [];
  const data = ctxReal.getImageData(0,0,canvasReal.width,canvasReal.height).data;
  const visited = Array(canvasReal.height).fill(0).map(()=>Array(canvasReal.width).fill(false));

  for(let y=0;y<canvasReal.height;y++){
    for(let x=0;x<canvasReal.width;x++){
      if(visited[y][x]) continue;
      let idx = (y*canvasReal.width + x)*4;
      if(data[idx]===0 && data[idx+1]===255 && data[idx+2]===30){
        greenSlots.push({x,y});
        // Segna area 96x96 come visitata
        for(let dy=0; dy<96; dy++){
          for(let dx=0; dx<96; dx++){
            if(y+dy<canvasReal.height && x+dx<canvasReal.width){
              visited[y+dy][x+dx] = true;
            }
          }
        }
      }
    }
  }

  // Ordina per x crescente, poi y crescente
  greenSlots.sort((a,b)=>{
    if(a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });

  createUploadInputs();
}

// Crea pulsanti upload + anteprime
function createUploadInputs(){
  uploadArea.innerHTML = "";

  greenSlots.forEach((slot,i)=>{
    let container = document.createElement("div");

    let preview = document.createElement("div");
    preview.className = "slotPreview";

    let label = document.createElement("p");
    label.innerText = "Slot #" + (i+1);

    let input = document.createElement("input");
    input.type = "file";

    input.onchange = (e)=>{
      let file = e.target.files[0];
      let reader = new FileReader();
      reader.onload = function(ev){
        let img = new Image();
        img.onload = function(){
          ctxReal.drawImage(img, slot.x, slot.y, 96, 96);
          updateCanvasView();
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

// Download banner reale
function downloadBanner(){
  const link = document.createElement("a");
  link.download = "worldwebwindows.png";
  link.href = canvasReal.toDataURL();
  link.click();
}

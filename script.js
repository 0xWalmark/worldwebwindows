const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let greenSlots = [];

function loadBanner(){
  let id = document.getElementById("tokenId").value;

  if(id < 1 || id > 2400){
    alert("Token ID must be between 1 and 2400");
    return;
  }

  let img = new Image();

  img.onload = function(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img,0,0);
    detectGreenSquares();
  };

  img.src = "images/"+id+".png"; // cartella corretta
}

function detectGreenSquares(){
  greenSlots = [];

  let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
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

function createUploadInputs() {
  let area = document.getElementById("uploadArea");
  area.innerHTML = "";

  greenSlots.forEach((slot, i) => {
    let container = document.createElement("div"); // div per griglia

    let label = document.createElement("p");
    label.innerText = "Slot " + (i+1);

    let input = document.createElement("input");
    input.type = "file";

    input.onchange = (e) => {
      let file = e.target.files[0];
      let reader = new FileReader();
      reader.onload = function(ev) {
        let img = new Image();
        img.onload = function() {
          ctx.drawImage(img, slot.x, slot.y, 96, 96);
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

function downloadBanner(){
  let link = document.createElement("a");
  link.download = "worldwebwindows.png";
  link.href = canvas.toDataURL();
  link.click();
}

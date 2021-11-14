var { Note } = Tonal;

var Instruments = [
  {
    name: "Bass Guitar (4-string)",
    frets: 24,
    tunings: [{
      name: "Standard",
      strings: ['E1', 'A1', 'D2', 'G2'],
    }, {
      name: "Drop D",
      strings: ['D1', 'A1', 'D2', 'G2'],
    }]
  },
  {
    name: "Bass Guitar (5-string)",
    frets: 24,
    tunings: [{
      name: "Standard",
      strings: ['B0', 'E1', 'A1', 'D2', 'G2'],
    }]
  },
  {
    name: "Bass Guitar (6-string)",
    frets: 24,
    tunings: [{
      name: "Standard",
      strings: ['B0', 'E1', 'A1', 'D2', 'G2', 'C3'],
    }]
  },
  {
    name: "Guitar (6-string)",
    frets: 22,
    tunings: [{
      name: "Standard",
      strings: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    }, {
      name: "Drop D",
      strings: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    }]
  },
]

var Style = {
  nut: {
    width: 5,
    color: '#000',
  },
  string: {
    width: 10,
    spacing: 64,
    color: '#888',
  },
  fret: {
    width: 3,
    color: '#888',
    labels: [3, 5, 7, 9, 12],
    font: '24px sans-serif',
  },
}

function startFretboard(){
  populateInstruments();
  populateTunings();

  $('#root').on('change', drawFretboard);
  $('#mode').on('change', drawFretboard);

  drawFretboard();
}

function populateInstruments() {
  let select = $('#instrument');
  select.find('option').remove();
  select.on('change', () => { populateTunings(); drawFretboard() } );

  for (let idx in Instruments) {
    select.append("<option value='"+idx+"'>"+Instruments[idx].name+"</option>")
  }
}

function populateTunings() {
  const instrument = Instruments[$('#instrument').val()];
  let select = $('#tuning');
  select.find('option').remove();
  select.on('change', drawFretboard);

  for (let idx in instrument.tunings) {
    select.append("<option value='"+idx+"'>"+instrument.tunings[idx].name+"</option>")
  }
}

function drawFretboard() {
  let instrument = Instruments[$('#instrument').val()];
  let tuning = instrument.tunings[$('#tuning').val()];
  let strings = tuning.strings;
  let scale = Tonal.Scale.get($('#root').val().toLowerCase() + ' ' + $('#mode').val().toLowerCase());

  let canvas = $('#fretboard');
  const parent = canvas.parent();
  const canvasWidth = parent.innerWidth();
  canvas = canvas.get(0);
  canvas.width = canvasWidth;
  canvas.height = parent.height();
  let ctx = canvas.getContext('2d');

  const fretWidth = (canvasWidth - (Style.fret.width * instrument.frets)) / (instrument.frets + 1);
  const fretSpacing = fretWidth + Style.fret.width;
  const fretHeight = (strings.length * Style.string.width) + ((strings.length-1) * Style.string.spacing);
  const markerSize = fretWidth / 2;

  const leftMargin = markerSize + ((fretWidth - markerSize) / 2);
  const topMargin = markerSize / 2;

  // Nut
  let x = leftMargin + Style.nut.width / 2;
  ctx.strokeStyle = Style.nut.color;
  ctx.lineWidth = Style.nut.width;
  ctx.beginPath();
  ctx.moveTo(x, topMargin);
  ctx.lineTo(x, topMargin + fretHeight);
  ctx.stroke();

  // Frets
  x = leftMargin + Style.nut.width + 1;
  ctx.strokeStyle = Style.fret.color;
  ctx.font = Style.fret.font;
  for (let fret = 1; fret <= instrument.frets; fret++) {
    ctx.beginPath();
    // fret numbers
    if (Style.fret.labels.indexOf( ((fret - 1) % 12) + 1 ) !== -1)  {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(fret.toString(), x + (fretWidth/2), topMargin + fretHeight + 30, fretWidth);
    }

    ctx.lineWidth = Style.fret.width;
    if ( fret > 1 && ((fret - 1) % 12) === 10 ) {
      ctx.lineWidth = Style.fret.width * 1.5;
    }

    x += fretSpacing;
    ctx.moveTo(parseInt(x)+0.5, topMargin);
    ctx.lineTo(parseInt(x)+0.5, topMargin+fretHeight);
    ctx.stroke();
  }

  // Strings and markers
  const scaleChromas = scale.notes.map(n => Tonal.Note.chroma(n));
  let y = topMargin + (Style.string.width / 2) + 0.5;
  ctx.textAlign = 'center';
  for (let [index, _string] of strings.reverse().entries()) {
    ctx.strokeStyle = Style.string.color;
    ctx.lineWidth = Style.string.width;
    ctx.beginPath();
    ctx.moveTo(leftMargin+Style.nut.width, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();

    // markers
    let note = Tonal.Note.get(tuning.strings[index]);
    let x = leftMargin + Style.nut.width + 1;
    const markerRadius = markerSize / 2
    for (let fret = 0; fret <= instrument.frets; fret++) {
      if ((scaleChroma = scaleChromas.indexOf(note.chroma)) > -1) {
        // let interval = scale.intervals[scaleChroma];
        let scaleNote = scale.notes[scaleChroma];

        let mx = parseInt(x)-markerSize-0.5;
        if (fret === 1) { mx -= leftMargin }

ctx.strokeStyle = 'black';
ctx.fillStyle = 'white';
ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mx + markerRadius, y);
        ctx.arc(mx, y, markerRadius, 0, Math.PI*2, 1);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'black';
        ctx.font = 'small-caps bold 24px sans-serif';
        ctx.textBaseline = 'bottom';
        ctx.fillText((scaleChroma+1) + '', mx, y + (markerRadius / 2) ); //, 10 );

        ctx.font = '13px sans-serif';
        ctx.textBaseline = 'bottom';
        ctx.fillText(scaleNote + '', mx, y + markerRadius);
      }

      x += fretSpacing;
      note = Tonal.Note.get(Tonal.Note.fromMidi(note.midi + 1));
    }

    y += Style.string.width + Style.string.spacing;
  }
}

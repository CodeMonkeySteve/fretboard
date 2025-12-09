const { Note } = Tonal;

const Style = {
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
  intervals: [
    { shape: 'square', bg: '#444',  fg: 'white' },
    {},
    {},
    { shape: 'circle', bg: '#666',  fg: 'white' },
    { shape: 'circle', bg: '#444',  fg: 'white' },
    {},
    {}
  ]
}

const Instruments = [
  {
    name: "Bass (4-string)",
    frets: 24,
    tunings: [{
      name: "Standard (E)",
      strings: ['E1', 'A1', 'D2', 'G2'],
    }, {
      name: "Eb",
      strings: ['Eb1', 'Ab1', 'Db2', 'Gb2'],
    }, {
      name: "Drop D",
      strings: ['D1', 'A1', 'D2', 'G2'],
    }, {
      name: "Drop C#",
      strings: ['C#1', 'G#1', 'C#2', 'F#2'],
    }, {
      name: "C#",
      strings: ['C#1', 'F#1', 'B1', 'E2'],
    }, {
      name: "Drop C",
      strings: ['C1', 'G1', 'C2', 'F2'],
    }]
  },
  {
    name: "Bass (5-string)",
    frets: 24,
    tunings: [{
      name: "Standard (E)",
      strings: ['B0', 'E1', 'A1', 'D2', 'G2'],
    }]
  },
  {
    name: "Bass (6-string)",
    frets: 24,
    tunings: [{
      name: "Standard (E)",
      strings: ['B0', 'E1', 'A1', 'D2', 'G2', 'C3'],
    }]
  },
  {
    name: "Guitar (6-string)",
    frets: 22,
    tunings: [{
      name: "Standard (E)",
      strings: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    }, {
      name: "Drop D",
      strings: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    }]
  },
  {
    name: "Guitar (7-string)",
    frets: 22,
    tunings: [{
      name: "Standard (E)",
      strings: ['B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    }]
  },
]

function shuffleArray(arr) {
  return arr.map(a => [Math.random(), a]).sort((a, b) => a[0] - b[0]).map(a => a[1])
}

shuffleList = []
function startFretboard(){
  populateInstruments();
  populateTunings();

  $('#root')
    .on('change', (el) => {
      localStorage.setItem('root', $(el.currentTarget).val());
      drawFretboard();
    })
    .val(localStorage.getItem('root') || 'C');
  $('#mode')
    .on('change', (el) => {
      localStorage.setItem('mode', $(el.currentTarget).val());
      drawFretboard();
    })
    .val(localStorage.getItem('mode') || 'Ionian');

  $('#instrument')
    .on('change', (ev) => { localStorage.setItem('instrument', $(ev.currentTarget).val()); })
    .val(localStorage.getItem('instrument') || '0');
  $('#tuning')
    .on('change', (ev) => { localStorage.setItem('tuning', $(ev.currentTarget).val()); })
    .val(localStorage.getItem('tuning') || '0');

  let shuffleList = []
  $('#shuffle').on('click', (ev) => {
    const root = $('#root')
    const btn = $(ev.currentTarget)

    if ( shuffleList.length === 0 ) {
      const curVal = root.val()
      shuffleList = shuffleArray(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']).filter(el => el !== curVal)
      shuffleList.push(curVal);
    }

    root.val(shuffleList.shift()).trigger('change')

    if ( shuffleList.length > 1 ) {
      btn.text("Next")
    } else if ( shuffleList.length === 1 ) {
      btn.text("Finish")
    } else if ( shuffleList.length === 0 ) {
      btn.text("Shuffle")
    }
  })

  drawFretboard();
}

function populateInstruments() {
  let select = $('#instrument');
  select.find('option').remove();
  select.on('change', () => {
    populateTunings();
    $('#tuning').change();
  } );

  for (let idx in Instruments) {
    let instrument = Instruments[idx];
    select.append("<option value='"+idx+"'>"+instrument.name+"</option>")
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
  let ctx = canvas.getContext('2d');

  const fretWidth = (canvasWidth - (Style.fret.width * instrument.frets)) / (instrument.frets + 1);
  const fretSpacing = fretWidth + Style.fret.width;
  const fretHeight = (strings.length * Style.string.width) + ((strings.length-1) * Style.string.spacing);
  const markerSize = fretWidth * 0.6;

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
      ctx.strokeStyle = Style.nut.color;
    } else {
      ctx.strokeStyle = Style.fret.color;
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
  for (let idx = 0; idx < strings.length; ++idx) {
    ctx.strokeStyle = Style.string.color;
    ctx.lineWidth = Style.string.width;
    ctx.beginPath();
    ctx.moveTo(leftMargin+Style.nut.width, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();

    // markers
    const string = strings[strings.length - 1 - idx];
    let note = Tonal.Note.get(string);
    let x = leftMargin + Style.nut.width + 1;
    const markerRadius = markerSize / 2;
    for ( let fret = 0; fret <= instrument.frets; fret++,
          x += fretSpacing,
          note = Tonal.Note.get(Tonal.Note.fromMidi(note.midi + 1))
        ) {
      const chroma = scaleChromas.indexOf(note.chroma)
      if (chroma === -1) { continue }

      const scaleNote = scale.notes[chroma];
      const mx = parseInt(x) - (fretSpacing / 2) - 0.5;
      const style = Style.intervals[chroma];

      switch (style.shape) {
        case 'square':
          ctx.beginPath();
          ctx.moveTo(mx - markerRadius, y - markerRadius);
          ctx.lineTo(mx + markerRadius, y - markerRadius);
          ctx.lineTo(mx + markerRadius, y + markerRadius);
          ctx.lineTo(mx - markerRadius, y + markerRadius);
          ctx.closePath();
          break;
        case 'circle':
        default:
          ctx.beginPath();
          ctx.moveTo(mx + markerRadius, y);
          ctx.arc(mx, y, markerRadius, 0, Math.PI * 2, 1);
          break;
      }

      ctx.fillStyle = style.bg || 'white';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'black';
      ctx.stroke();

      ctx.fillStyle = style.fg || 'black';
      ctx.font = 'small-caps bold 24px sans-serif';
      ctx.textBaseline = 'bottom';
      ctx.fillText((chroma+1) + '', mx, y + (markerRadius / 3) );

      ctx.font = '13px sans-serif';
      ctx.textBaseline = 'bottom';
      ctx.fillText(scaleNote + '', mx, y + (markerRadius / 1.2));

    }

    y += Style.string.width + Style.string.spacing;
  }
}

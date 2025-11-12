// Скрипт за обновяване на работните часове на барбърите
// Изпълни в MongoDB Compass или mongo shell

// За Иван Кръстев (работи от 12:00 в сряда)
db.barbers.updateOne(
  {
    $or: [
      { name: /иван/i },
      { name: /ivan/i },
      { _id: ObjectId("690c9a836832a4d4a7087762") },
    ],
  },
  {
    $set: {
      workHours: {
        start: 8,
        end: 20,
        wednesdayStart: 12, // Важно! В сряда започва от 12:00
        lunchBreak: true,
      },
    },
  }
);

// За всички останали барбъри (default часове)
db.barbers.updateMany(
  {
    workHours: { $exists: false },
  },
  {
    $set: {
      workHours: {
        start: 8,
        end: 20,
        lunchBreak: true,
      },
    },
  }
);

// Проверка - покажи всички барбъри с техните часове
db.barbers.find({}, { name: 1, workHours: 1 }).pretty();

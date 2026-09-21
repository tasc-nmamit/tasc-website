require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const facultyList = [
  {
    name: "Dr. Sharada U Shenoy",
    email: "sharadauday@nitte.edu.in",
    designation: "Professor & Head",
    image: "https://firebasestorage.googleapis.com/v0/b/tasc-8df79.appspot.com/o/Images%2FFaculty%2FsharadaShenoy.jpg?alt=media&token=200cacf2-67c5-49db-8f98-ac2cc5ed695a",
    about: [
      "Ph.D in CSE 2020 Area: Multimedia Transmission over MANETs VTU Belagavi – 590018, Karnataka, India.",
      "Master of Technology (M.Tech) in CSE 2005 NMAM Institute of Technology, Nitte - 574110, Karkala, Udupi, Karnataka, India.",
      "Bachelor of Engineering (B.E) in CSE 1998 NMAM Institute of Technology, Nitte - 574110, Karkala, Udupi, Karnataka, India.",
      "April 2021 to till date Professor & Head , NMAM Institute of Technology, Nitte"
    ],
    order: 0,
    designation2: null
  },
  {
    name: "Dr. Laxmi Gulappagol",
    email: "laxmi.gulappagol@nitte.edu.in",
    designation: "Associate Professor",
    image: "https://firebasestorage.googleapis.com/v0/b/tasc-8df79.appspot.com/o/Images%2FFaculty%2FlaxmiG.jpg?alt=media&token=029a79c0-d39e-4ace-aed3-cf0fb4dfef1d",
    about: [
      "B.E. in Electronics and Communication Engineering from Basaveshwar Engineering College, Bagalkote – 587103, affiliated to Visvesvaraya Technological University (VTU), Belagavi, Karnataka, India completed in 2007.",
      "M.Tech in Networking and Internet Engineering from Jawaharlal Nehru New College of Engineering, Shivamogga– 577204, affiliated to Visvesvaraya Technological University (VTU), Belagavi, Karnataka, India completed in 2012.",
      "Ph.D - Visvesvaraya Technological University Belagavi – 590018, Karnataka, India in 2021."
    ],
    order: 1,
    designation2: null
  },
  {
    name: "Dr. Ranjan Kumar H S",
    email: "ranjan.hs@nitte.edu.in",
    designation: "Associate Professor",
    image: "https://nitte.edu.in/admin/photo/3/faculty/166/4060.jpg",
    about: [
      "Ph.D. -Visvesvaraya Technological University (VTU), Belagavi, Karnataka -Research Area: Cyber Security and Information Security",
      "M.Tech. in Computer Science & Engineering - NMAM Institute of Technology, Nitte",
      "B.E./B.Tech. in Information Science & Engineering - Coorg Institute of Technology, Visvesvaraya Technological University",
      "Shri Madhwa Vadiraja Institute of Technology and Management, Udupi - Associate Professor from 29-04-2024 to 30-06-2026"
    ],
    order: 2,
    designation2: null
  },
  {
    name: "Dr. Rashmi Adyapady R",
    email: "rashmi.adyapady@nitte.edu.in",
    designation: "Assistant Professor Gd.III",
    image: "https://firebasestorage.googleapis.com/v0/b/tasc-8df79.appspot.com/o/Images%2FFaculty%2FrashmiAdyapady.jpg?alt=media&token=5a76e7a1-bfce-4a00-80f0-a8473dadf8ca",
    about: [
      "Ph.D. in CSE, awarded in the year 2023 from National Institute of Technology Karnataka (NITK), Surathkal.",
      "MTech in CSE, awarded in the year 2014 from NMAM Institute of Technology (NMAMIT), Nitte.",
      "B.E. in CSE, awarded in the year 2011 from ST. Joseph Engineering College (SJEC), Vamanjoor."
    ],
    order: 3,
    designation2: null
  },
  {
    name: "Dr. Sudesh Rao",
    email: "sudesh.rao@nitte.edu.in",
    designation: "Assistant Professor Gd.III",
    image: "https://firebasestorage.googleapis.com/v0/b/tasc-8df79.appspot.com/o/Images%2FFaculty%2FsudeshRao.jpg?alt=media&token=e6d7c3ae-ab20-4b10-a1a2-58199a5f15ce",
    about: [
      "B. E in Computer Science and Engineering from Moodlakatte Institute of Technology ,Kundapura",
      "M.Tech in Computer Science and Engineering from Srinivas School of Engineering ,Mukka",
      "Ph.D",
      "5 years Experience as Assistant Professor in the Department of Computer Science and Engineering, SSE, Mangalore.",
      "1 Year of experience as Assistant Professor in RNSIT, Bangalore.",
      "7 Months of experience as Assistant Software Specialist in Manipal University, Manipal."
    ],
    order: 4,
    designation2: null
  },
  {
    name: "Dr. Disha D N",
    email: "disha.dn@nitte.edu.in",
    designation: "Assistant Professor Gd.III",
    image: "https://firebasestorage.googleapis.com/v0/b/tasc-8df79.appspot.com/o/Images%2FFaculty%2FdishaDN.jpg?alt=media&token=f38d34fc-9802-4983-a1a9-4621d4cf192f",
    about: [
      "BE- (Computer Science and Engineering), MITE, Moodabidri -2014",
      "M.Tech-(Computer Science and Engineering), M S Ramaiah Institute of Technology, Bangalore - 2016",
      "PhD (Machine learning) - (2018 registered)",
      "4 years of Teaching Experience as an Assistant Professor at Nitte Meenakshi Institute of Technology, Bangalore",
      "1 Years of Teaching Experience as an Assistant Professor at RNS Institute of Technology Bangalore"
    ],
    order: 5,
    designation2: null
  },
  {
    name: "Ms. Soumya Santhosha",
    email: "soumya.santhosh@nitte.edu.in",
    designation: "Assistant Professor Gd.III",
    image: "https://nitte.edu.in/admin/photo/3/faculty/166/4055.jpg",
    about: [
      "M.Tech –NITK, Surathkal, India-2013",
      "BE – SJEC, Mangalore, India-2007",
      "Assistant Professor, CSE | Yenepoya Institute of Technology, Thodar,Moodbidri - November 2020 – June 2026",
      "Assistant Professor, CSE | St. Joseph Engineering College, Vamanjoor, Mangalore - July 2018 – July 2020",
      "Assistant Professor, CSE | NIE Institute of Technology, Koorgalli, Mysore - February 2016 – June 2018",
      "Assistant Professor, CSE | NIE Institute of Technology, Koorgalli, Mysore - August 2014 – November 2014"
    ],
    order: 6,
    designation2: null
  },
  {
    name: "Mr. Mahesh B L",
    email: "mahesh.bl@nitte.edu.in",
    designation: "Assistant Professor Gd.II",
    image: "https://firebasestorage.googleapis.com/v0/b/tasc-8df79.appspot.com/o/Images%2FFaculty%2FmaheshBL.jpg?alt=media&token=f1b5e74b-eb5e-4d76-aa4b-f7822fc0cdef",
    about: [
      "Master of Technology in “Computer Science and Information Security(CSIS)” from Manipal Institute of Technology (A constituent institute of Manipal University), Manipal, Karnataka-2013.",
      "Bachelor of Engineering in “Computer Science (CSE)” from Canara Engineering College (Affiliated to VTU Belagavi), Benjanapadavu, Bantwal, Karnataka – 2010."
    ],
    order: 7,
    designation2: null
  },
  {
    name: "Ms. Swathi Pai M",
    email: "swathi.pai@nitte.edu.in",
    designation: "Assistant Professor Gd.II",
    image: "https://firebasestorage.googleapis.com/v0/b/tasc-8df79.appspot.com/o/Images%2FFaculty%2FswathiPai.jpg?alt=media&token=f1d9f6ea-9b5a-4cbc-8b35-84259e8dcb6a",
    about: [
      "B.E",
      "M.Tech",
      "Ph.D (Pursuing)",
      "July 2023 - NMAM Institute of Technology - Assistant Professor Gd.-I",
      "August’22 to June 2023 Presidency University -Assistant Professor",
      "August’19 to August’ 22 Reva University -Assistant Professor",
      "Since July’16 to July’19 NMAM Institute of Technology, Nitte, Udupi- Assistant Professor"
    ],
    order: 8,
    designation2: null
  },
  {
    name: "Ms. Sneha Shetty R",
    email: "sneha.r@nitte.edu.in",
    designation: "Assistant Professor Gd.II",
    image: "https://firebasestorage.googleapis.com/v0/b/tasc-8df79.appspot.com/o/Images%2FFaculty%2FsnehaShetty.jpg?alt=media&token=0be6203b-f474-4deb-a2b2-a109edad881a",
    about: [
      "Ph. D –pursuing from IIIT DHARWAD.",
      "M. Tech., Sahyadri College of Engineering and Management, 2017",
      "B. E., SDMIT Ujire, 2015",
      "Worked as Assistant Lecturer in the department of Computer Science and Engineering at NITK, Surathkal from January 2023 to jully 2023.",
      "Worked as Assistant Professor in the Department of Computer Science and Engineering at St. Joseph Engineering College, Vamanjoor from September 2021 to March 2022."
    ],
    order: 9,
    designation2: null
  },
  {
    name: "Ms. Smitha Rai",
    email: "smitha.rai@nitte.edu.in",
    designation: "Assistant Professor Gd.II",
    image: "https://firebasestorage.googleapis.com/v0/b/tasc-8df79.appspot.com/o/Images%2FFaculty%2Fsmitha.jpg?alt=media&token=ab35295b-33bc-4da8-b534-afb03649758e",
    about: [
      "Ph. D –Registered in VTU -2021 (Speech Signal Processing , Deep Learning)",
      "M.Tech- NMAMIT, Nitte -VTU-2018",
      "AMIE – The Institution of Engineers (India) - 2015",
      "Worked as Assistant Professor in Dept. of CSE at Yenepoya Institute of Technology, Moodbidri from 23rdJuly 2018 to 15th Sep 2023.",
      "Worked as Lab Instructor in CSE department at SSE, Mukka from July 2011 to July 2015",
      "Worked as guest Lecturer at Govt. I.T.I (W), Mangalore from August 2007 to July 2010."
    ],
    order: 10,
    designation2: null
  },
  {
    name: "Ms. Rakshitha",
    email: "rakshitha.s@nitte.edu.in",
    designation: "Assistant Professor Gd.II",
    image: "https://firebasestorage.googleapis.com/v0/b/tasc-8df79.appspot.com/o/Images%2FFaculty%2Frakshitha.jpg?alt=media&token=9aca044e-c4bd-4f21-beda-c6f64ca05c47",
    about: [
      "BE- Shree Devi Institute Of Technology,Mangalore-VTU-2010",
      "M.Tech- NMAMIT, Nitte -VTU-2017",
      "Ph. D –Registered in VTU -2021 (Natural Language Processing, Deep Learning)",
      "Worked as Assistant Professor at SJEC,Mangaluru from August 2021 to July 2022.",
      "Worked as Assistant Professor at CMRIT,Bangalore from April 2018to May 2019.",
      "Worked as Assistant Professor at Yenepoya Institute of Technology,Moodbidri from July 2015 to June 2017."
    ],
    order: 11,
    designation2: null
  },
  {
    name: "Mr. Prakash P",
    email: "prakash.p@nitte.edu.in",
    designation: "Assistant Professor Gd.II",
    image: "https://nitte.edu.in/admin/photo/3/faculty/166/4097.jpg",
    about: [
      "Ph.D-(Pursuing), NITK, Surathkal",
      "M.Tech- Information Technology- NITK, Surathkal- (2012-2015)",
      "BE-Information Science and Engineering, MSRIT-Bangaluru-(2007-2011)",
      "2026 – Present: Department of Artificial Intelligence and Machine Learning, NMAM Institute of Technology, Nitte (Deemed to be University)",
      "2023-2025: Senior Research Fellow at NITK, Surathkal"
    ],
    order: 12,
    designation2: null
  },
  {
    name: "Mr. Arun M Kudur",
    email: "arun.kudur@nitte.edu.in",
    designation: "Professor of Practice",
    image: "https://firebasestorage.googleapis.com/v0/b/tasc-8df79.appspot.com/o/Images%2FFaculty%2FarunKudur.jpg?alt=media&token=c72a2f7b-8b02-49d7-95c4-844ad0654508",
    about: [
      "Master’s degree in Information Technology from Harvard University",
      "Bachelor’s degree in Electronics & Communications Engineering from the University of Mysore."
    ],
    order: 13,
    designation2: null
  }
];

function generateCuid() {
  return 'cm' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

async function seedFaculty() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Shift current orders to prevent unique constraint conflicts during updates
    await client.query('UPDATE "Faculty" SET "order" = "order" + 1000');

    // 2. Fetch all existing faculty
    const existing = await client.query('SELECT id, name, email FROM "Faculty"');
    console.log(`Found ${existing.rows.length} existing faculty records in database.`);

    for (const f of facultyList) {
      // Find matching existing record
      const match = existing.rows.find(row => {
        if (f.email && row.email && row.email.toLowerCase() === f.email.toLowerCase()) {
          return true;
        }
        // Match by lastName / primary keyword
        const normName = (str) => str.toLowerCase().replace(/[^a-z]/g, '');
        return normName(row.name).includes(normName(f.name)) || normName(f.name).includes(normName(row.name));
      });

      if (match) {
        console.log(`Updating existing faculty ${match.name} -> ${f.name} (order ${f.order})`);
        await client.query(
          `UPDATE "Faculty" 
           SET name = $1, email = $2, designation = $3, image = $4, about = $5, "order" = $6, published = true, "designation2" = $7
           WHERE id = $8`,
          [f.name, f.email, f.designation, f.image, f.about, f.order, f.designation2, match.id]
        );
      } else {
        const newId = generateCuid();
        console.log(`Inserting new faculty ${f.name} with id ${newId} (order ${f.order})`);
        await client.query(
          `INSERT INTO "Faculty" (id, name, email, designation, image, about, "order", published, "designation2")
           VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8)`,
          [newId, f.name, f.email, f.designation, f.image, f.about, f.order, f.designation2]
        );
      }
    }

    await client.query('COMMIT');
    console.log('Faculty seeding successfully committed.');

    // Verify
    const verify = await client.query('SELECT id, name, email, designation, "order", published, "designation2" FROM "Faculty" ORDER BY "order" ASC');
    console.log(`\nVerified ${verify.rows.length} Faculty in Database:`);
    verify.rows.forEach(r => {
      console.log(`[#${r.order}] ${r.name} - ${r.designation} (${r.email || 'no email'}) | designation2: ${r.designation2}`);
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding faculty:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedFaculty();

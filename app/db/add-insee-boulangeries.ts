import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import csv from "fast-csv";

declare global {
  var __prisma: PrismaClient;
}
if (!global.__prisma) {
  global.__prisma = new PrismaClient();
}

const prisma = global.__prisma;

type CSVRecord = {
  siren: string;
  nic: string;
  siret: string;
  statutDiffusionEtablissement: string;
  dateCreationEtablissement: string;
  trancheEffectifsEtablissement: string;
  anneeEffectifsEtablissement: string;
  activitePrincipaleRegistreMetiersEtablissement: string;
  dateDernierTraitementEtablissement: string;
  etablissementSiege: string;
  nombrePeriodesEtablissement: string;
  complementAdresseEtablissement: string;
  numeroVoieEtablissement: string;
  indiceRepetitionEtablissement: string;
  typeVoieEtablissement: string;
  libelleVoieEtablissement: string;
  codePostalEtablissement: string;
  libelleCommuneEtablissement: string;
  libelleCommuneEtrangerEtablissement: string;
  distributionSpecialeEtablissement: string;
  codeCommuneEtablissement: string;
  codeCedexEtablissement: string;
  libelleCedexEtablissement: string;
  codePaysEtrangerEtablissement: string;
  libellePaysEtrangerEtablissement: string;
  complementAdresse2Etablissement: string;
  numeroVoie2Etablissement: string;
  indiceRepetition2Etablissement: string;
  typeVoie2Etablissement: string;
  libelleVoie2Etablissement: string;
  codePostal2Etablissement: string;
  libelleCommune2Etablissement: string;
  libelleCommuneEtranger2Etablissement: string;
  distributionSpeciale2Etablissement: string;
  codeCommune2Etablissement: string;
  codeCedex2Etablissement: string;
  libelleCedex2Etablissement: string;
  codePaysEtranger2Etablissement: string;
  libellePaysEtranger2Etablissement: string;
  dateDebut: string;
  etatAdministratifEtablissement: string;
  enseigne1Etablissement: string;
  enseigne2Etablissement: string;
  enseigne3Etablissement: string;
  denominationUsuelleEtablissement: string;
  activitePrincipaleEtablissement: string;
  nomenclatureActivitePrincipaleEtablissement: string;
  caractereEmployeurEtablissement: string;
  y_latitude: string;
  x_longitude: string;
};

async function migrateCSVData() {
  console.log(path.join("./", "./app/data/10_71C_with_longitude.csv"));
  const filePath = path.join("./", "./app/data/10_71C_with_longitude.csv");
  let stream = fs.createReadStream(filePath);

  let index = 0;

  let csvStream = csv
    .parse({ headers: true }) // use the same parameters as before
    .on("data", async (record: CSVRecord) => {
      try {
        index++;
        if (index % 10000 === 0) {
          console.log("boulanges", index);
        }
        if (record.etatAdministratifEtablissement !== "A") return null;
        let streetAddress = ``;
        if (record.numeroVoieEtablissement)
          streetAddress += record.numeroVoieEtablissement;
        if (record.indiceRepetitionEtablissement)
          streetAddress += record.indiceRepetitionEtablissement;
        if (record.typeVoieEtablissement)
          streetAddress += ` ${record.typeVoieEtablissement}`;
        if (record.libelleVoieEtablissement)
          streetAddress += ` ${record.libelleVoieEtablissement}`;
        if (record.complementAdresseEtablissement)
          streetAddress += ` ${record.complementAdresseEtablissement}`;

        await prisma.shop.create({
          data: {
            name:
              record.enseigne1Etablissement ||
              record.enseigne2Etablissement ||
              record.denominationUsuelleEtablissement,
            type: record.activitePrincipaleEtablissement,
            startDate: record.dateDebut ? new Date(record.dateDebut) : null,
            siret: record.siret,
            streetAddress,
            addresspostalCode: record.codePostalEtablissement,
            addressLocality: record.libelleCommuneEtablissement,
            addressCountry: record.libellePaysEtrangerEtablissement,
            longitude: parseFloat(record.y_latitude),
            latitude: parseFloat(record.x_longitude),
            created_by_user_id: "c739b8fa-8151-4fa6-951b-3bcfe4cbd085",
            etatAdministratifEtablissement:
              record.etatAdministratifEtablissement === "A"
                ? "Active"
                : "Inactive",
          },
        });
      } catch (error) {
        console.error("Could not create Shop:", error, record);
      }
    })
    .on("end", async () => {
      console.log("CSV file successfully processed");
    });

  stream.pipe(csvStream);
}

global.__prisma
  .$connect()
  .then(() => {
    console.log("Connected to DB");
  })
  .then(async () => {
    // migrations
    console.log("start migration !!");
    // create shops
    await migrateCSVData();
    console.log("done migration");
  })
  .catch((e) => {
    console.log("error connecting to DB", e);
  });

// Importez la bibliothèque Algolia
const express = require('express');
const serverless = require('serverless-http')
const algoliasearch = require('algoliasearch');
// Importez Vue pour accéder à la propriété $contentful
const Contentful = require('contentful') 
require('dotenv').config();

const algoliaApiKey = process.env.ALGOLIA_API_KEY;
const contentfulApiKey = process.env.CONTENTFUL_API_KEY;

// Create an instance of the Express app
const app = express();

// Create a router to handle routes
const router = express.Router();
// Route pour l'indexation des données
const clientContentFul = Contentful.createClient({
  space: 'ijpmkw98fb9q',
  accessToken: contentfulApiKey
})

const contentfulClient = clientContentFul
// Créez une instance Algolia en utilisant votre identifiant et votre clé d'API
const client = algoliasearch('X3LOXZO0EA', algoliaApiKey);

// Spécifiez le nom de l'index dans lequel vous souhaitez indexer vos projets
const index = client.initIndex('dev_JIBOIANA');

router.get('/', (req, res)=>{
  res.json({
    hello: "hi!"
  });
})
// Définissez un point de terminaison pour le webhook "Index entries"
router.post('/contentful-webhook/index', async (req, res) => {
  // Récupérez les données du projet envoyées par le webhook Contentful
  const projet = req.body;

  // Extrait les informations nécessaires du projet
  const { sys, fields } = projet;
  const { id } = sys;
  const { title, /* autres champs */ } = fields;

  // Mettez à jour ou ajoutez l'enregistrement correspondant dans l'index Algolia
  const object = { objectID: id, title /* autres champs */ };
  try {
    await index.saveObject(object);
    console.log('Enregistrement indexé avec succès sur Algolia');
    res.sendStatus(200);
  } catch (error) {
    console.error('Erreur lors de l\'indexation sur Algolia:', error);
    res.sendStatus(500);
  }
});

// Définissez un point de terminaison pour le webhook "Delete unpublished entries"
// router.post('/contentful-webhook/delete', async (req, res) => {
//   // Récupérez les données de l'entrée supprimée envoyées par le webhook Contentful
//   const deletedEntry = req.body;

//   // Extrait l'ID de l'entrée supprimée
//   const { sys } = deletedEntry;
//   const { id } = sys;

//   // Supprimez l'enregistrement correspondant de l'index Algolia
//   try {
//     await index.deleteObject(id);
//     console.log('Enregistrement supprimé avec succès de l\'index Algolia');
//     res.sendStatus(200);
//   } catch (error) {
//     console.error('Erreur lors de la suppression de l\'enregistrement sur Algolia:', error);
//     res.sendStatus(500);
//   }
// });

// Fonction pour publier tous les projets existants sur Algolia
// async function publishAllProjects() {
//   try {
//     const entries = await contentfulClient.getEntries({
//       content_type: 'project',
//       include: 10 // Assurez-vous que le nombre d'inclusions correspond à vos besoins
//     });

//     const objects = entries.items.map(item => {
//       const { sys, fields } = item;
//       const { id } = sys;
//       const { title, /* autres champs */ } = fields;
//       return { objectID: id, title /* autres champs */ };
//     });

//     await index.saveObjects(objects);
//     console.log('Tous les projets ont été publiés sur Algolia');
//   } catch (error) {
//     console.error('Erreur lors de la publication des projets sur Algolia:', error);
//   }
// }



// Use the router to handle requests to the `/.netlify/functions/api` path
app.use(`/.netlify/functions/indexToAlgolia`, router);

// Export the app and the serverless function
module.exports = app;
module.exports.handler = serverless(app);



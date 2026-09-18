import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const contentType = strapi.contentType('api::article.article');
    const contentTypeService = strapi.plugin('content-manager').service('content-types');
    const configuration = await contentTypeService.findConfiguration(contentType);

    const fieldLabels: Record<string, string> = {
      reference: 'Référence produit',
      description: 'Description',
      cover: 'Couverture',
      codebarre: 'Code-barre',
      designation: 'Designation',
      'technical-file': 'Fiche technique',
      'niveau-stock': 'Niveau de Stock',
      ranges: 'Déclinaison',
      packaging: 'Collisage',
    };

    const needsUpdate = Object.entries(fieldLabels).some(
      ([field, label]) =>
        configuration.metadatas[field].edit.label !== label ||
        configuration.metadatas[field].list.label !== label
    );

    if (needsUpdate) {
      const updatedMetadatas = { ...configuration.metadatas };
      for (const [field, label] of Object.entries(fieldLabels)) {
        updatedMetadatas[field] = {
          ...updatedMetadatas[field],
          edit: { ...updatedMetadatas[field].edit, label },
          list: { ...updatedMetadatas[field].list, label },
        };
      }

      await contentTypeService.updateConfiguration(contentType, {
        ...configuration,
        metadatas: updatedMetadatas,
      });
    }
  },
};

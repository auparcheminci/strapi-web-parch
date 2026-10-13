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
      'reference-parch': 'Référence produit',
      'reference-fournisseur': 'Référence fournisseur',
      description: 'Description',
      cover: 'Couverture',
      codebarre: 'Code-barre',
      designation: 'Designation',
      'technical-file': 'Fiche technique',
      category: 'Famille',
      ranges: 'Déclinaison',
      packaging: 'Collisage',
    };

    const primaryFields = new Set([
      'designation',
      'reference-parch',
      'reference-fournisseur',
      'category',
      'cover',
      'technical-file',
    ]);
    const primaryRows = [
      [
        { name: 'reference-parch', size: 6 },
        { name: 'reference-fournisseur', size: 6 },
      ],
      [
        { name: 'designation', size: 6 },
        { name: 'category', size: 6 },
      ],
    ];
    const editLayout = configuration.layouts.edit;
    const updatedEditLayout = [
      ...primaryRows,
      ...editLayout
        .map((row) => row.filter((field) => !primaryFields.has(field.name)))
        .filter((row) => row.length > 0),
      [
        { name: 'cover', size: 6 },
        { name: 'technical-file', size: 6 },
      ],
    ];

    const needsUpdate =
      JSON.stringify(editLayout) !== JSON.stringify(updatedEditLayout) ||
      Object.entries(fieldLabels).some(
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
        layouts: {
          ...configuration.layouts,
          edit: updatedEditLayout,
        },
        metadatas: updatedMetadatas,
      });
    }
  },
};

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
      referenceParch: 'Référence produit',
      referenceFournisseur: 'Référence fournisseur',
      description: 'Description',
      cover: 'Couverture',
      codebarre: 'Code-barre',
      designation: 'Designation',
      technicalFile: 'Fiche technique',
      supportDeCommunication: 'Support de communication',
      category: 'Famille',
      ranges: 'Déclinaison',
      packaging: 'Collisage',
    };
    const referenceParchDescription = 'Ecrit ici la référence sur Sage';

    const primaryFields = new Set([
      'designation',
      'referenceParch',
      'referenceFournisseur',
      'category',
      'fournisseur',
      'marque',
      'cover',
      'technicalFile',
      'supportDeCommunication',
    ]);
    const primaryRows = [
      [
        { name: 'referenceParch', size: 6 },
        { name: 'referenceFournisseur', size: 6 },
      ],
      [
        { name: 'designation', size: 6 },
        { name: 'category', size: 6 },
      ],
      [
        { name: 'fournisseur', size: 6 },
        { name: 'marque', size: 6 },
      ],
    ];
    const editLayout = configuration.layouts.edit;
    const updatedEditLayout = [
      ...primaryRows,
      ...editLayout
        .map((row) => row.filter((field) => !primaryFields.has(field.name)))
        .filter((row) => row.length > 0),
      [
        { name: 'cover', size: 4 },
        { name: 'technicalFile', size: 4 },
        { name: 'supportDeCommunication', size: 4 },
      ],
    ];

    const needsUpdate =
      JSON.stringify(editLayout) !== JSON.stringify(updatedEditLayout) ||
      configuration.metadatas.referenceParch.edit.description !==
        referenceParchDescription ||
      Object.entries(fieldLabels).some(
        ([field, label]) =>
          configuration.metadatas[field].edit.label !== label ||
          configuration.metadatas[field].list.label !== label
      );

    if (needsUpdate) {
      const updatedMetadatas = { ...configuration.metadatas };
      updatedMetadatas.referenceParch = {
        ...updatedMetadatas.referenceParch,
        edit: {
          ...updatedMetadatas.referenceParch.edit,
          description: referenceParchDescription,
        },
      };
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

    const catalogueContentType = strapi.contentType('api::catalogue.catalogue');
    const catalogueConfiguration = await contentTypeService.findConfiguration(catalogueContentType);
    const catalogueEditLayout = [
      [{ name: 'nomDuCatalogue', size: 12 }],
      [{ name: 'Marque', size: 12 }],
      [{ name: 'Fournisseur', size: 12 }],
      [{ name: 'Gammes', size: 12 }],
      [{ name: 'Document', size: 12 }],
      [{ name: 'Couverture', size: 12 }],
    ];

    if (
      JSON.stringify(catalogueConfiguration.layouts.edit) !== JSON.stringify(catalogueEditLayout) ||
      catalogueConfiguration.settings.mainField !== 'nomDuCatalogue' ||
      catalogueConfiguration.settings.defaultSortBy !== 'nomDuCatalogue' ||
      catalogueConfiguration.settings.defaultSortOrder !== 'ASC'
    ) {
      await contentTypeService.updateConfiguration(catalogueContentType, {
        ...catalogueConfiguration,
        layouts: {
          ...catalogueConfiguration.layouts,
          edit: catalogueEditLayout,
        },
        settings: {
          ...catalogueConfiguration.settings,
          mainField: 'nomDuCatalogue',
          defaultSortBy: 'nomDuCatalogue',
          defaultSortOrder: 'ASC',
        },
      });
    }
  },
};

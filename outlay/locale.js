"use strict";

export let userLang, localeString;

const localeStringArray = {
  de: {
    add: "hinzufügen",
    addCategory: "Kategorie hinzufügen",
    and: "und",
    backup: "backup",
    category: "kategorie",
    categoryCanNotBeDeleted: "kategorie kann nicht gelöscht werden",
    categoryDelete: "kategorie löschen",
    categoryEdit: "kategorie bearbeiten",
    categoryIsUsedReason: "mindestens ein Häkchen bezieht sich darauf",
    categoryNameEdit: "kategorienamen bearbeiten",
    categoryNameNotChanged: "category name not changed",
    categoryNameNotSet: "Kategoriename nicht geändert",
    categorySave: "kategorie speichern",
    categories: "kategorien",
    check: "prüfen",
    checkDateNotSet: "prüfdatum nicht eingestellt",
    checks: "prüft",
    chooseFileToRestore: "wählen Sie die wiederherzustellende Datei aus",
    confirmBackup: "möchten Sie wirklich eine datenbank sichern?",
    confirmCategoryDelete: "möchten sie die kategorie wirklich löschen?",
    confirmCheckDelete: "möchten sie den scheck wirklich löschen?",
    confirmRestore:
      "möchten Sie die datenbank wirklich aus der ausgewählten datei wiederherstellen?",
    databaseRestored: "datenbank wiederhergestellt",
    error: "error",
    errorFileLoad: "fehler beim laden der datei",
    errorFileStructure: "dateistrukturfehler",
    fileNotSelected: "datei nicht ausgewählt",
    fileToRestoreCheck: "datei zum wiederherstellen überprüfen",
    forDate: "zum",
    from: "von",
    impossibleToDeleteRootCategory:
      "es ist unmöglich, die stammkategorie zu löschen",
    invalidDate: "ungültiges datum",
    invalidMimeType: "ungültiger mime-Typ",
    invalidTableName: "ungültiger tabellenname",
    moreThanOneFileSelected: "mehr als eine datei ausgewählt",
    moveCategory: "kategorie verschieben",
    newCategory: "neue Kategorie",
    newRecord: "neuer eintrag",
    noCategorySelected: "keine kategorie ausgewählt",
    noneOfTheParametersSpecified: "keiner der angegebenen parameter",
    notSet: "nicht eingestellt",
    ofFile: "der datei",
    restore: "wiederherstellen",
    restoreDatabaseFromFile: "datenbank aus datei wiederherstellen",
    restorationOfTablesOfObjects: "Wiederherstellung von Objekttabellen",
    results: "ergebnisse",
    root: "wurzel",
    rootCategoryCanNotBeChanged: "stammkategorie kann nicht geändert werden",
    save: "speichern",
    simultaneouslySetParameters: "gleichzeitig parameter einstellen",
    since: "schon seit",
    thisCategoryHasSubcategory: "diese kategorie hat eine unterkategorie",
    table: "tabelle",
    tableErase: "tabelle löschen",
    tableRestoreFromFile: "tabellenwiederherstellung aus datei",
    total: "gesamt",
    until: "bis",
    utility: "nützlichkeit",
    yes: "ja",
  },

  en: {
    add: "add",
    addCategory: "add category",
    and: "and",
    backup: "backup",
    category: "category",
    categoryCanNotBeDeleted: "category cannot be deleted",
    categoryDelete: "delete category",
    categoryEdit: "category edit",
    categoryIsUsedReason: "at least one check item refers to it",
    categoryNameEdit: "edit category name",
    categoryNameNotChanged: "category name not changed",
    categoryNameNotSet: "category name not set",
    categorySave: "category save",
    categories: "categories",
    check: "check",
    checkDateNotSet: "check date not set",
    checks: "checks",
    chooseFileToRestore: "choose file to restore",
    confirmBackup: "do you really want to backup database?",
    confirmCategoryDelete: "do you really want to delete category?",
    confirmCheckDelete: "do you really want to delete check?",
    confirmRestore:
      "do you really want to restore database from selected file?",
    databaseRestored: "database restored",
    error: "error",
    errorFileLoad: "file load error",
    errorFileStructure: "file structure error",
    fileNotSelected: "file not selected",
    fileToRestoreCheck: "file to restore check",
    forDate: "for",
    from: "from",
    impossibleToDeleteRootCategory: "it's impossible to delete root category",
    invalidDate: "invalid date",
    invalidMimeType: "invalid mime-type",
    invalidTableName: "invalid table name",
    moreThanOneFileSelected: "more than one file selected",
    moveCategory: "move category",
    newCategory: "new category",
    newRecord: "new record",
    noCategorySelected: "no category selected",
    noneOfTheParametersSpecified: "none of the parameters specified",
    notSet: "not set",
    ofFile: "of file",
    restore: "restore",
    restoreDatabaseFromFile: "restore database from file",
    restorationOfTablesOfObjects: "restoration of tables of objects",
    results: "results",
    root: "root",
    rootCategoryCanNotBeChanged: "root category cannot be changed",
    save: "save",
    simultaneouslySetParameters: "simultaneously set parameters",
    since: "since",
    thisCategoryHasSubcategory: "this category has subcategory",
    table: "table",
    tableErase: "table erase",
    tableRestoreFromFile: "table restore from file",
    total: "total",
    until: "until",
    utility: "utility",
    yes: "yes",
  },

  es: {
    add: "añadir",
    addCategory: "añadir categoría",
    and: "y",
    backup: "apoyo",
    category: "categoría",
    categoryCanNotBeDeleted: "la categoría no se puede eliminar",
    categoryDelete: "eliminar categoría",
    categoryEdit: "editar categoría",
    categoryIsUsedReason: "al menos un elemento de verificación se refiere",
    categoryNameEdit: "editar nombre de categoría",
    categoryNameNotChanged: "nombre de categoría no cambiado",
    categoryNameNotSet: "nombre de categoría no establecido",
    categorySave: "categoría guardar",
    categories: "categorías",
    check: "comprobar",
    checkDateNotSet: "comprobar fecha no establecida",
    checks: "cheques",
    chooseFileToRestore: "elija el archivo para restaurar",
    confirmBackup:
      "¿Realmente quieres hacer una copia de seguridad de la base de datos?",
    confirmCategoryDelete: "¿De verdad quieres eliminar la categoría?",
    confirmCheckDelete: "¿De verdad quieres eliminar el cheque?",
    confirmRestore:
      "¿De verdad quieres restaurar la base de datos del archivo seleccionado?",
    databaseRestored: "base de datos restaurada",
    error: "error",
    errorFileLoad: "error de carga de archivo",
    errorFileStructure: "error de estructura de archivo",
    fileNotSelected: "archivo no seleccionado",
    fileToRestoreCheck: "archivo para restaurar el cheque",
    forDate: "para",
    from: "desde",
    impossibleToDeleteRootCategory: "es imposible eliminar la categoría raíz",
    invalidDate: "fecha invalida",
    invalidMimeType: "tipo mime no válido",
    invalidTableName: "nombre de tabla inválido",
    moreThanOneFileSelected: "más de un archivo seleccionado",
    moveCategory: "mover categoría",
    newCategory: "nueva categoría",
    newRecord: "nuevo record",
    noCategorySelected: "ninguna categoría seleccionada",
    noneOfTheParametersSpecified: "ninguno de los parámetros especificados",
    notSet: "no establecido",
    ofFile: "de archivo",
    restore: "restaurar",
    restoreDatabaseFromFile: "restaurar la base de datos del archivo",
    restorationOfTablesOfObjects: "restauración de tablas de objetos",
    results: "resultados",
    root: "raíz",
    rootCategoryCanNotBeChanged: "la categoría raíz no se puede cambiar",
    save: "salvar",
    simultaneouslySetParameters: "establecer parámetros simultáneamente",
    since: "ya que",
    thisCategoryHasSubcategory: "esta categoría tiene subcategoría",
    table: "mesa",
    tableErase: "limpieza de mesa",
    tableRestoreFromFile: "restaurar mesa desde archivo",
    total: "total",
    until: "hasta",
    utility: "utilidad",
    yes: "si",
  },

  fr: {
    add: "ajouter",
    addCategory: "ajouter une catégorie",
    and: "et",
    backup: "sauvegarde",
    category: "catégorie",
    categoryCanNotBeDeleted: "la catégorie ne peut pas être supprimée",
    categoryDelete: "supprimer la catégorie",
    categoryEdit: "modification de catégorie",
    categoryIsUsedReason: "au moins un élément de contrôle y fait référence",
    categoryNameEdit: "modifier le nom de la catégorie",
    categoryNameNotChanged: "nom de catégorie non modifié",
    categoryNameNotSet: "nom de catégorie non défini",
    categorySave: "catégorie enregistrer",
    categories: "catégories",
    check: "chèque",
    checkDateNotSet: "chèque la date non définie",
    checks: "chèques",
    chooseFileToRestore: "choisissez le fichier à restaurer",
    confirmBackup: "voulez-vous vraiment sauvegarder la base de données?",
    confirmCategoryDelete: "voulez-vous vraiment supprimer la catégorie?",
    confirmCheckDelete: "voulez-vous vraiment supprimer le chèque?",
    confirmRestore:
      "voulez-vous vraiment restaurer la base de données à partir du fichier sélectionné?",
    databaseRestored: "base de données restaurée",
    error: "erreur",
    errorFileLoad: "erreur de chargement de fichier",
    errorFileStructure: "erreur de structure de fichier",
    fileNotSelected: "fichier non sélectionné",
    fileToRestoreCheck: "fichier à restaurer",
    forDate: "pour",
    from: "de",
    impossibleToDeleteRootCategory:
      "il est impossible de supprimer la catégorie racine",
    invalidDate: "date invalide",
    invalidMimeType: "type MIME non valide",
    invalidTableName: "nom de table non valide",
    moreThanOneFileSelected: "plusieurs fichiers sélectionnés",
    moveCategory: "déplacer la catégorie",
    newCategory: "nouvelle catégorie",
    newRecord: "nouvel enregistrement",
    noCategorySelected: "aucune catégorie sélectionnée",
    noneOfTheParametersSpecified: "aucun des paramètres spécifiés",
    notSet: "pas encore défini",
    ofFile: "du dossier",
    restore: "restaurer",
    restoreDatabaseFromFile:
      "restaurer la base de données à partir d'un fichier",
    restorationOfTablesOfObjects: "restauration de tables d'objets",
    results: "résultats",
    root: "racine",
    rootCategoryCanNotBeChanged:
      "la catégorie racine ne peut pas être modifiée",
    save: "enregistrer",
    simultaneouslySetParameters: "définir simultanément les paramètres",
    since: "depuis",
    thisCategoryHasSubcategory: "cette catégorie a une sous-catégorie",
    table: "table",
    tableErase: "effacer la table",
    tableRestoreFromFile: "restauration de table à partir d'un fichier",
    total: "total",
    until: "jusqu'à",
    utility: "utilitaire",
    yes: "oui",
  },

  hi: {
    add: "जोड़ना",
    addCategory: "श्रेणी जोड़ें",
    and: "और",
    backup: "संग्रह",
    category: "श्रेणी",
    categoryCanNotBeDeleted: "श्रेणी नहीं हटाई जा सकती",
    categoryDelete: "श्रेणी हटाएं",
    categoryEdit: "श्रेणी बदलें",
    categoryIsUsedReason: "कम से कम एक चेक आइटम इसे संदर्भित करता है",
    categoryNameEdit: "श्रेणी का नाम बदलें",
    categoryNameNotChanged: "श्रेणी का नाम नहीं बदला गया",
    categoryNameNotSet: "श्रेणी का नाम सेट नहीं है",
    categorySave: "श्रेणी सहेजें",
    categories: "श्रेणी",
    check: "चेक",
    checkDateNotSet: "जाँच तिथि निर्धारित नहीं है",
    checks: "चेकों",
    chooseFileToRestore: "पुनर्स्थापित करने के लिए फ़ाइल का चयन करें",
    confirmBackup: "क्या आप वाकई व्यय डेटाबेस को संग्रहीत करना चाहते हैं?",
    confirmCategoryDelete: "क्या आप वाकई व्यय श्रेणी को हटाना चाहते हैं?",
    confirmCheckDelete: "क्या आप वाकई चेक हटाना चाहते हैं?",
    confirmRestore:
      "क्या आप वाकई चयनित फ़ाइल से डेटाबेस को पुनर्स्थापित करना चाहते हैं?",
    databaseRestored: "डेटाबेस पुनर्स्थापित किया गया",
    error: "एक गलती",
    errorFileLoad: "फ़ाइल अपलोड त्रुटि",
    errorFileStructure: "फ़ाइल संरचना त्रुटि",
    fileNotSelected: "फ़ाइल चयनित नहीं है",
    fileToRestoreCheck: "फ़ाइल वसूली की जाँच करें",
    forDate: "के लिए",
    from: "साथ",
    invalidDate: "गलत तारीख",
    invalidMimeType: "अवैध माइम प्रकार",
    invalidTableName: "अमान्य तालिका नाम",
    impossibleToDeleteRootCategory: "रूट श्रेणी को हटाने में असमर्थ",
    moreThanOneFileSelected: "एक से अधिक फ़ाइल चयनित हैं",
    moveCategory: "श्रेणी को स्थानांतरित करें",
    newCategory: "नई श्रेणी",
    newRecord: "नई प्रविष्टि",
    noCategorySelected: "कोई श्रेणी नहीं चुनी गई",
    noneOfTheParametersSpecified: "निर्दिष्ट मापदंडों में से कोई भी नहीं",
    notSet: "सेट नहीं है",
    ofFile: "फ़ाइल",
    restore: "वसूली",
    restoreDatabaseFromFile: "डेटाबेस को फ़ाइल से पुनर्स्थापित करें",
    results: "परिणाम",
    restorationOfTablesOfObjects: "वस्तुओं की तालिकाओं को पुनर्स्थापित करें",
    root: "जड़",
    rootCategoryCanNotBeChanged: "रूट श्रेणी में बदलाव न करें",
    save: "बनाए रखने के",
    simultaneouslySetParameters: "एक साथ पैरामीटर सेट करें",
    since: "क्योंकि",
    table: "तालिका",
    tableErase: "टेबल की सफाई",
    tableRestoreFromFile: "संग्रह से तालिका पुनर्स्थापित करें",
    thisCategoryHasSubcategory: "इस श्रेणी में एक उपश्रेणी है",
    total: "कुल मिलाकर",
    until: "को",
    utility: "उपयोगिताओं",
    yes: "हां",
  },

  ja: {
    add: "追加する",
    addCategory: "カテゴリを追加",
    and: "と",
    backup: "アーカイブ",
    category: "カテゴリー",
    categoryCanNotBeDeleted: "カテゴリは削除できません",
    categoryDelete: "カテゴリを削除",
    categoryEdit: "カテゴリを変更",
    categoryIsUsedReason: "少なくとも1つのチェック項目がそれを参照しています",
    categoryNameEdit: "カテゴリ名を変更する",
    categoryNameNotChanged: "カテゴリ名は変更されていません",
    categoryNameNotSet: "カテゴリ名が設定されていません",
    categorySave: "カテゴリを保存",
    categories: "カテゴリー",
    check: "チェックする",
    checkDateNotSet: "チェック日付が設定されていません",
    checks: "チェック",
    chooseFileToRestore: "復元するファイルを選択",
    confirmBackup: "経費データベースをアーカイブしてもよろしいですか？",
    confirmCategoryDelete: "費用カテゴリを削除してもよろしいですか？",
    confirmCheckDelete: "チェックを削除してもよろしいですか？",
    confirmRestore:
      "選択したファイルからデータベースを復元してもよろしいですか？",
    databaseRestored: "データベースが復元されました",
    error: "間違い",
    errorFileLoad: "ファイルアップロードエラー",
    errorFileStructure: "ファイル構造エラー",
    fileNotSelected: "ファイルが選択されていません",
    fileToRestoreCheck: "ファイル回復チェック",
    forDate: "のために",
    from: "と",
    invalidDate: "間違った日付",
    invalidMimeType: "無効なMIMEタイプ",
    invalidTableName: "無効なテーブル名",
    impossibleToDeleteRootCategory: "ルートカテゴリを削除できません",
    moreThanOneFileSelected: "複数のファイルが選択されています",
    moveCategory: "カテゴリを移動",
    newCategory: "新しいカテゴリー",
    newRecord: "新規エントリー",
    noCategorySelected: "カテゴリが選択されていません",
    noneOfTheParametersSpecified: "指定されたパラメーターはありません",
    notSet: "設定されていません",
    ofFile: "ファイル",
    restore: "回復",
    restoreDatabaseFromFile: "ファイルからデータベースを復元する",
    results: "結果",
    restorationOfTablesOfObjects: "オブジェクトのテーブルを復元する",
    root: "根",
    rootCategoryCanNotBeChanged: "ルートカテゴリを変更しないでください",
    save: "保存する",
    simultaneouslySetParameters: "同時に設定するパラメータ",
    since: "以来",
    table: "テーブル",
    tableErase: "テーブルクリーニング",
    tableRestoreFromFile: "アーカイブからテーブルを復元する",
    thisCategoryHasSubcategory: "このカテゴリにはサブカテゴリがあります",
    total: "合計",
    until: "前に",
    utility: "ユーティリティ",
    yes: "はい",
  },

  pt: {
    add: "adicionar",
    addCategory: "adicionar categoria",
    and: "e",
    backup: "arquivamento",
    category: "categoria",
    categoryCanNotBeDeleted: "categoria não pode ser excluída",
    categoryDelete: "excluir categoria",
    categoryEdit: "mudar categoria",
    categoryIsUsedReason: "pelo menos um item de verificação se refere a ele",
    categoryNameEdit: "alterar nome da categoria",
    categoryNameNotChanged: "nome da categoria não alterado",
    categoryNameNotSet: "nome da categoria não definido",
    categorySave: "salvar categoria",
    categories: "categorias",
    check: "verificar",
    checkDateNotSet: "data de verificação não definida",
    checks: "cheques",
    chooseFileToRestore: "selecione o arquivo para restaurar",
    confirmBackup:
      "Tem certeza de que deseja arquivar o banco de dados de despesas?",
    confirmCategoryDelete:
      "Tem certeza de que deseja excluir a categoria de despesa?",
    confirmCheckDelete: "Tem certeza de que deseja excluir a verificação?",
    confirmRestore:
      "Tem certeza de que deseja restaurar o banco de dados a partir do arquivo selecionado?",
    databaseRestored: "banco de dados restaurado",
    error: "um erro",
    errorFileLoad: "erro de upload de arquivo",
    errorFileStructure: "erro na estrutura do arquivo",
    fileNotSelected: "arquivo não selecionado",
    fileToRestoreCheck: "verificação de recuperação de arquivo",
    forDate: "para",
    from: "com",
    invalidDate: "data errada",
    invalidMimeType: "tipo MIME inválido",
    invalidTableName: "nome de tabela inválido",
    impossibleToDeleteRootCategory: "incapaz de excluir a categoria raiz",
    moreThanOneFileSelected: "mais de um arquivo selecionado",
    moveCategory: "mover categoria",
    newCategory: "nova categoria",
    newRecord: "nova entrada",
    noCategorySelected: "nenhuma categoria selecionada",
    noneOfTheParametersSpecified: "nenhum dos parâmetros especificados",
    notSet: "não definido",
    ofFile: "arquivo",
    restore: "recuperação",
    restoreDatabaseFromFile: "restaurar banco de dados do arquivo",
    results: "resultados",
    restorationOfTablesOfObjects: "restaurar tabelas de objetos",
    root: "raiz",
    rootCategoryCanNotBeChanged: "você não pode alterar a categoria raiz",
    save: "salvar",
    simultaneouslySetParameters: "definir parâmetros simultaneamente",
    since: "desde",
    table: "mesa",
    tableErase: "limpeza de mesa",
    tableRestoreFromFile: "restaurar tabela do arquivo",
    thisCategoryHasSubcategory: "esta categoria tem uma subcategoria",
    total: "total",
    until: "antes",
    utility: "utilitários",
    yes: "sim",
  },

  ru: {
    add: "добавить",
    addCategory: "добавить категорию",
    and: "и",
    backup: "архивирование",
    category: "категория",
    categoryCanNotBeDeleted: "категорию нельзя удалить",
    categoryDelete: "удалить категорию",
    categoryEdit: "изменение категории",
    categoryIsUsedReason: "на нее ссылается как минимум одна позиция в чеке",
    categoryNameEdit: "изменить название категории",
    categoryNameNotChanged: "название категории не изменено",
    categoryNameNotSet: "не задано название категории",
    categorySave: "сохранить категорию",
    categories: "категории",
    check: "чек",
    checkDateNotSet: "не задана дата чека",
    checks: "чеки",
    chooseFileToRestore: "выберите файл для восстановления",
    confirmBackup: "вы действительно хотите архивировать базу данных расходов?",
    confirmCategoryDelete:
      "вы действительно хотите удалить категорию расходов?",
    confirmCheckDelete: "Вы действительно хотите удалить чек?",
    confirmRestore:
      "вы действительно хотите восстановить базу данных из выбранного файла?",
    databaseRestored: "база данных восстановлена",
    error: "ошибка",
    errorFileLoad: "ошибка загрузки файла",
    errorFileStructure: "ошибка структуры файла",
    fileNotSelected: "файл не выбран",
    fileToRestoreCheck: "проверка восстанавливаемого файла",
    forDate: "за",
    from: "с",
    invalidDate: "неправильная дата",
    invalidMimeType: "недопустимый mime-тип",
    invalidTableName: "недопустимое имя таблицы",
    impossibleToDeleteRootCategory: "невозможно удалить корневую категорию",
    moreThanOneFileSelected: "выбрано более одного файла",
    moveCategory: "переместить категорию",
    newCategory: "новая категория",
    newRecord: "новая запись",
    noCategorySelected: "не выбрана категория",
    noneOfTheParametersSpecified: "не задан ни один из параметров",
    notSet: "не задана",
    ofFile: "файла",
    restore: "восстановление",
    restoreDatabaseFromFile: "восстановить базу данных из файла",
    results: "итоги",
    restorationOfTablesOfObjects: "восстановление таблиц объектов",
    root: "корень",
    rootCategoryCanNotBeChanged: "нельзя изменить корневую категорию",
    save: "сохранить",
    simultaneouslySetParameters: "одновременно заданы параметры",
    since: "так как",
    table: "таблица",
    tableErase: "очистка таблицы",
    tableRestoreFromFile: "восстановление таблицы из архива",
    thisCategoryHasSubcategory: "у этой категории есть подкатегория",
    total: "итого",
    until: "до",
    utility: "утилиты",
    yes: "да",
  },

  zh: {
    add: "加",
    addCategory: "添加类别",
    and: "和",
    backup: "存档",
    category: "类别",
    categoryCanNotBeDeleted: "类别不能删除",
    categoryDelete: "删除类别",
    categoryEdit: "变更类别",
    categoryIsUsedReason: "至少有一项检查项目",
    categoryNameEdit: "更改类别名称",
    categoryNameNotChanged: "类别名称未更改",
    categoryNameNotSet: "未设置类别名称",
    categorySave: "保存类别",
    categories: "类别",
    check: "检查",
    checkDateNotSet: "未设定检查日期",
    checks: "支票",
    chooseFileToRestore: "选择要还原的文件",
    confirmBackup: "您确定要存档费用数据库吗？",
    confirmCategoryDelete: "您确定要删除费用类别吗？",
    confirmCheckDelete: "您确定要删除支票吗？",
    confirmRestore: "您确定要从所选文件还原数据库吗？",
    databaseRestored: "数据库还原",
    error: "一个错误",
    errorFileLoad: "文件上传错误",
    errorFileStructure: "文件结构错误",
    fileNotSelected: "未选择文件",
    fileToRestoreCheck: "文件恢复检查",
    forDate: "为",
    from: "与",
    invalidDate: "错误的日期",
    invalidMimeType: "无效的哑剧类型",
    invalidTableName: "无效的表名",
    impossibleToDeleteRootCategory: "无法删除根类别",
    moreThanOneFileSelected: "选择了多个文件",
    moveCategory: "移动类别",
    newCategory: "新类别",
    newRecord: "新条目",
    noCategorySelected: "未选择类别",
    noneOfTheParametersSpecified: "没有指定参数",
    notSet: "没有设置",
    ofFile: "档案",
    restore: "恢复",
    restoreDatabaseFromFile: "从文件还原数据库",
    results: "结果",
    restorationOfTablesOfObjects: "恢复对象表",
    root: "корень",
    rootCategoryCanNotBeChanged: "不要更改根类别",
    save: "保存",
    simultaneouslySetParameters: "同时设置参数",
    since: "从",
    table: "桌子",
    tableErase: "桌子清洁",
    tableRestoreFromFile: "从档案还原表",
    thisCategoryHasSubcategory: "这个类别有一个子类别",
    total: "合计",
    until: "之前",
    utility: "公用事业",
    yes: "是的",
  },
};

export class Locale {
  static setUserLang() {
    // https://qna.habr.com/q/338809
    userLang = (navigator.language || navigator.userLanguage)
      .substr(0, 2)
      .toLowerCase();
    //userLang = "de";
    if (!Object.getOwnPropertyDescriptor(localeStringArray, userLang)) {
      userLang = "en";
    }
    localeString = localeStringArray[userLang];
  }
}

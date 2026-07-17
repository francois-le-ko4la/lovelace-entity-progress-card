/*
 * Generated from translations/*.json (source of truth) - do not edit by
 * hand. Run: node scripts/translations.js synchronize --to-js
 */

/* eslint-disable sonarjs/no-duplicate-string */
const TRANSLATIONS = {
  ar: {
    card: {
      msg: {
        appliedDefaultValue: 'تم تطبيق قيمة افتراضية تلقائيًا.',
        attributeNotFound: 'لم يتم العثور على الخاصية في Home Assistant.',
        entityNotFound: 'لم يتم العثور على الكيان في Home Assistant.',
        invalidActionObject: 'كائن الإجراء غير صالح أو غير منظم بشكل صحيح.',
        invalidDecimal: 'يجب أن تكون القيمة رقمًا عشريًا صحيحًا.',
        invalidEntityId: 'معرّف الكيان غير صالح أو به خلل.',
        invalidEnumValue: 'القيمة المُقدمة ليست من الخيارات المسموح بها.',
        invalidStateContent: 'محتوى الحالة غير صالح أو معيب.',
        invalidStateContentEntry: 'إدخال أو أكثر في محتوى الحالة غير صالحة.',
        invalidTheme: 'السمة المحددة غير معروفة. سيتم استخدام السمة الافتراضية.',
        invalidTypeArray: 'كان من المتوقع قيمة من نوع مصفوفة.',
        invalidTypeBoolean: 'كان من المتوقع قيمة من نوع منطقي.',
        invalidTypeNumber: 'كان من المتوقع قيمة من نوع رقم.',
        invalidTypeObject: 'كان من المتوقع قيمة من نوع كائن.',
        invalidTypeString: 'كان من المتوقع قيمة من نوع سلسلة.',
        invalidUnionType: 'القيمة لا تطابق أي نوع مسموح.',
        missingActionKey: 'مفتاح مطلوب مفقود في كائن الإجراء.',
        missingRequiredProperty: 'خاصية مطلوبة مفقودة.'
      }
    },
    editor: {
      title: {
        content: 'المحتوى',
        interaction: 'التفاعلات',
        theme: 'المظهر'
      },
      field: {
        attribute: 'السمة',
        badge_color: 'لون الشارة',
        badge_icon: 'أيقونة الشارة',
        bar_color: 'لون الشريط',
        bar_effect_jinja: 'تأثير الشريط (وضع Jinja)',
        bar_orientation: 'اتجاه الشريط',
        bar_position: 'موضع الشريط',
        bar_single_line: 'معلومات في سطر واحد',
        bar_size: 'حجم الشريط',
        bar_segments: 'Bar segments',
        bar_color_mode: 'وضع اللون',
        bar_scale: 'Bar scale',
        center_zero: 'صفر في الوسط',
        center_zero_value: 'قيمة المركز',
        center_zero_growth_percent: 'نسبة النمو',
        color: 'اللون الأساسي',
        decimal: 'عشري',
        double_tap_action: 'الإجراء عند النقر المزدوج',
        entity: 'الكيان',
        force_circular_background: 'فرض خلفية دائرية',
        hide_jinja: 'إخفاء (وضع Jinja)',
        hold_action: 'الإجراء عند الضغط المطول',
        icon: 'أيقونة',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'الإجراء عند النقر المزدوج على الأيقونة',
        icon_hold_action: 'الإجراء عند الضغط المطول على الأيقونة',
        icon_tap_action: 'الإجراء عند النقر على الأيقونة',
        layout: 'تخطيط المحتوى',
        max_value: 'القيمة القصوى',
        min_value: 'القيمة الدنيا',
        name: 'الاسم',
        percent: 'النسبة المئوية',
        reverse_secondary_info_row: 'تبديل الشريط والنص',
        secondary: 'معلومات ثانوية',
        state_content: 'محتوى الحالة',
        show_all_actions: 'إظهار جميع الإجراءات',
        tap_action: 'الإجراء عند النقر القصير',
        text_shadow: 'إضافة ظل للنص',
        theme_mode: 'Theme mode',
        theme: 'السمة',
        custom_theme: 'Custom theme zones',
        unit: 'الوحدة',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'معلومات إضافية (ثانوية)',
        multiline: 'Multiline',
        interpolate: 'تدرج الألوان',
        name_info: 'معلومات إضافية (الاسم)',
        reverse: 'عكس المؤقت',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'كيانات إضافية',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'مثالي عند الانخفاض (CPU، RAM...)',
          optimal_when_high: 'مثالي عند الارتفاع (البطارية...)',
          light: 'الضوء',
          temperature: 'درجة الحرارة',
          humidity: 'الرطوبة',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'صغيرة',
          medium: 'متوسطة',
          large: 'كبيرة',
          xlarge: 'كبيرة جدًا'
        },
        bar_orientation: {
          ltr: 'من اليسار إلى اليمين',
          rtl: 'من اليمين إلى اليسار',
          up: 'اتجاه لأعلى'
        },
        bar_position: {
          default: 'افتراضي',
          below: 'الشريط تحت المحتوى',
          top: 'الشريط أعلى المحتوى',
          bottom: 'الشريط أسفل المحتوى',
          overlay: 'الشريط فوق المحتوى (تراكب)',
          background: 'خلفية البطاقة'
        },
        layout: {
          horizontal: 'أفقي (افتراضي)',
          vertical: 'رأسي'
        },
        bar_color_mode: {
          auto: 'تلقائي',
          segment: 'مقطعي',
          rainbow: 'قوس قزح'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'حواف دائرية',
          glass: 'زجاج',
          gradient: 'تدرج',
          gradient_reverse: 'تدرج معكوس',
          shimmer: 'لمعان',
          shimmer_reverse: 'لمعان معكوس'
        },
        hide: {
          icon: 'أيقونة',
          name: 'الاسم',
          value: 'القيمة',
          unit: 'الوحدة',
          secondary_info: 'المعلومات',
          progress_bar: 'الشريط'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  bn: {
    card: {
      msg: {
        appliedDefaultValue: 'ডিফল্ট মান স্বয়ংক্রিয়ভাবে প্রয়োগ করা হয়েছে।',
        attributeNotFound: 'HA তে বৈশিষ্ট্য পাওয়া যায়নি।',
        entityNotFound: 'HA তে সত্তা পাওয়া যায়নি।',
        invalidActionObject: 'অ্যাকশন অবজেক্ট অবৈধ বা ভুলভাবে গঠিত।',
        invalidDecimal: 'মানটি একটি বৈধ দশমিক সংখ্যা হতে হবে।',
        invalidEntityId: 'সত্তার আইডি অবৈধ বা ভুলভাবে গঠিত।',
        invalidEnumValue: 'প্রদত্ত মানটি অনুমোদিত বিকল্পগুলির মধ্যে একটি নয়।',
        invalidStateContent: 'অবস্থার বিষয়বস্তু অবৈধ বা ভুলভাবে গঠিত।',
        invalidStateContentEntry: 'অবস্থার বিষয়বস্তুতে একটি বা একাধিক এন্ট্রি অবৈধ।',
        invalidTheme: 'নির্দিষ্ট থিম অজানা। ডিফল্ট থিম ব্যবহার করা হবে।',
        invalidTypeArray: 'অ্যারে ধরনের একটি মান প্রত্যাশিত।',
        invalidTypeBoolean: 'বুলিয়ান ধরনের একটি মান প্রত্যাশিত।',
        invalidTypeNumber: 'সংখ্যা ধরনের একটি মান প্রত্যাশিত।',
        invalidTypeObject: 'অবজেক্ট ধরনের একটি মান প্রত্যাশিত।',
        invalidTypeString: 'স্ট্রিং ধরনের একটি মান প্রত্যাশিত।',
        invalidUnionType: 'মানটি অনুমোদিত ধরনগুলির কোনোটির সাথে মেলে না।',
        missingActionKey: 'অ্যাকশন অবজেক্টে একটি প্রয়োজনীয় কী অনুপস্থিত।',
        missingRequiredProperty: 'প্রয়োজনীয় বৈশিষ্ট্য অনুপস্থিত।'
      }
    },
    editor: {
      title: {
        content: 'বিষয়বস্তু',
        interaction: 'মিথস্ক্রিয়া',
        theme: 'চেহারা এবং অনুভূতি'
      },
      field: {
        attribute: 'বৈশিষ্ট্য',
        badge_color: 'ব্যাজের রঙ',
        badge_icon: 'ব্যাজ আইকন',
        bar_color: 'বারের রঙ',
        bar_effect_jinja: 'বারের প্রভাব (Jinja মোড)',
        bar_orientation: 'বারের অভিমুখ',
        bar_position: 'বারের অবস্থান',
        bar_single_line: 'এক লাইনে তথ্য',
        bar_size: 'বারের আকার',
        bar_segments: 'Bar segments',
        bar_color_mode: 'রঙের মোড',
        bar_scale: 'Bar scale',
        center_zero: 'মাঝে শূন্য',
        center_zero_value: 'কেন্দ্রীয় মান',
        center_zero_growth_percent: 'প্রবৃদ্ধির শতাংশ',
        color: 'প্রাথমিক রঙ',
        decimal: 'দশমিক',
        double_tap_action: 'ডাবল ট্যাপ আচরণ',
        entity: 'সত্তা',
        force_circular_background: 'বৃত্তাকার পটভূমি জোর করুন',
        hide_jinja: 'লুকান (Jinja মোড)',
        hold_action: 'হোল্ড আচরণ',
        icon: 'আইকন',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'আইকন ডাবল ট্যাপ আচরণ',
        icon_hold_action: 'আইকন হোল্ড আচরণ',
        icon_tap_action: 'আইকন ট্যাপ আচরণ',
        layout: 'বিষয়বস্তুর বিন্যাস',
        max_value: 'সর্বোচ্চ মান',
        min_value: 'ন্যূনতম মান',
        name: 'নাম',
        percent: 'শতাংশ',
        reverse_secondary_info_row: 'বার এবং টেক্সট অদলবদল করুন',
        secondary: 'দ্বিতীয় তথ্য',
        state_content: 'স্টেটের বিষয়বস্তু',
        show_all_actions: 'সব অ্যাকশন দেখান',
        tap_action: 'ট্যাপ আচরণ',
        text_shadow: 'টেক্সটে ছায়া যোগ করুন',
        theme_mode: 'Theme mode',
        theme: 'থিম',
        custom_theme: 'Custom theme zones',
        unit: 'একক',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'কাস্টম সেকেন্ডারি তথ্য',
        multiline: 'Multiline',
        interpolate: 'রঙ ইন্টারপোলেশন',
        name_info: 'কাস্টম নাম তথ্য',
        reverse: 'টাইমার উল্টানো',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'অতিরিক্ত সত্তা',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'কম হলে সর্বোত্তম (CPU, RAM,...)',
          optimal_when_high: 'বেশি হলে সর্বোত্তম (ব্যাটারি...)',
          light: 'আলো',
          temperature: 'তাপমাত্রা',
          humidity: 'আর্দ্রতা',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'ছোট',
          medium: 'মাঝারি',
          large: 'বড়',
          xlarge: 'অতিরিক্ত বড়'
        },
        bar_orientation: {
          ltr: 'বাম থেকে ডানে',
          rtl: 'ডান থেকে বামে',
          up: 'উপরের দিকে'
        },
        bar_position: {
          default: 'ডিফল্ট',
          below: 'বিষয়বস্তুর নিচে বার',
          top: 'উপরের দিকে বার',
          bottom: 'নিচের দিকে বার',
          overlay: 'বিষয়বস্তুর ওপর বার (ওভারলে)',
          background: 'কার্ড পটভূমি'
        },
        layout: {
          horizontal: 'অনুভূমিক (ডিফল্ট)',
          vertical: 'উল্লম্ব'
        },
        bar_color_mode: {
          auto: 'স্বয়ংক্রিয়',
          segment: 'বিভাগ',
          rainbow: 'রেইনবো'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'বৃত্তাকার কোণ',
          glass: 'কাচ',
          gradient: 'গ্রেডিয়েন্ট',
          gradient_reverse: 'উল্টো গ্রেডিয়েন্ট',
          shimmer: 'শিমার',
          shimmer_reverse: 'উল্টো শিমার'
        },
        hide: {
          icon: 'আইকন',
          name: 'নাম',
          value: 'মান',
          unit: 'একক',
          secondary_info: 'তথ্য',
          progress_bar: 'বার'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  ca: {
    card: {
      msg: {
        appliedDefaultValue: 'S\'ha aplicat automàticament un valor per defecte.',
        attributeNotFound: 'No s\'ha trobat l\'atribut a Home Assistant.',
        entityNotFound: 'No s\'ha trobat l\'entitat a Home Assistant.',
        invalidActionObject: 'L\'objecte d\'acció és invàlid o té una estructura incorrecta.',
        invalidDecimal: 'El valor ha de ser un decimal vàlid.',
        invalidEntityId: 'L\'ID de l\'entitat no és vàlid o té un format incorrecte.',
        invalidEnumValue: 'El valor proporcionat no és una opció vàlida.',
        invalidStateContent: 'El contingut de l\'estat és invàlid o té un format incorrecte.',
        invalidStateContentEntry: 'Una o més entrades del contingut de l\'estat són invàlides.',
        invalidTheme: 'El tema especificat és desconegut. S\'utilitzarà el tema per defecte.',
        invalidTypeArray: 'S\'esperava un valor de tipus array.',
        invalidTypeBoolean: 'S\'esperava un valor de tipus boolean.',
        invalidTypeNumber: 'S\'esperava un valor de tipus número.',
        invalidTypeObject: 'S\'esperava un valor de tipus objecte.',
        invalidTypeString: 'S\'esperava un valor de tipus cadena.',
        invalidUnionType: 'El valor no coincideix amb cap dels tipus permesos.',
        missingActionKey: 'Falta una clau obligatòria a l\'objecte d\'acció.',
        missingRequiredProperty: 'Falta una propietat obligatòria.'
      }
    },
    editor: {
      title: {
        content: 'Contingut',
        interaction: 'Interacció',
        theme: 'Aparença i tema'
      },
      field: {
        attribute: 'Atribut',
        badge_color: 'Color de la insígnia',
        badge_icon: 'Icona de la insígnia',
        bar_color: 'Color principal',
        bar_effect_jinja: 'Efecte de la barra (mode Jinja)',
        bar_orientation: 'Orientació de la barra',
        bar_position: 'Posició de la barra',
        bar_single_line: 'Informació en una sola línia',
        bar_size: 'Mida de la barra',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Mode de color',
        bar_scale: 'Bar scale',
        center_zero: 'Zero al centre',
        center_zero_value: 'Valor de centratge',
        center_zero_growth_percent: 'Percentatge de creixement',
        color: 'Color principal',
        decimal: 'Decimal',
        double_tap_action: 'Acció al doble tocar',
        entity: 'Entitat',
        force_circular_background: 'Forçar fons circular',
        hide_jinja: 'Amaga (mode Jinja)',
        hold_action: 'Acció en mantenir premut',
        icon: 'Icona',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Acció al doble tocar la icona',
        icon_hold_action: 'Acció en mantenir premuda la icona',
        icon_tap_action: 'Acció al tocar la icona',
        layout: 'Disposició del contingut',
        max_value: 'Valor màxim',
        min_value: 'Valor mínim',
        name: 'Nom',
        percent: 'Percentatge',
        reverse_secondary_info_row: 'Intercanvia barra i text',
        secondary: 'Informació secundària',
        state_content: 'Contingut de l\'estat',
        show_all_actions: 'Mostra totes les accions',
        tap_action: 'Acció al tocar breument',
        text_shadow: 'Afegir ombra al text',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Custom theme zones',
        unit: 'Unitat',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Informació addicional (secundària)',
        multiline: 'Multiline',
        interpolate: 'Interpolar colors',
        name_info: 'Informació addicional (nom)',
        reverse: 'Temporitzador invers',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Entitats addicionals',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Òptim quan és baix (CPU, RAM…)',
          optimal_when_high: 'Òptim quan és alt (Bateria…)',
          light: 'Llum',
          temperature: 'Temperatura',
          humidity: 'Humitat',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Petita',
          medium: 'Mitjana',
          large: 'Gran',
          xlarge: 'Extra gran'
        },
        bar_orientation: {
          ltr: 'D\'esquerra a dreta',
          rtl: 'De dreta a esquerra',
          up: 'Cap amunt'
        },
        bar_position: {
          default: 'Predeterminada',
          below: 'Barra sota el contingut',
          top: 'Barra a sobre',
          bottom: 'Barra a sota',
          overlay: 'Barra superposada al contingut (overlay)',
          background: 'Fons de la targeta'
        },
        layout: {
          horizontal: 'Horitzontal (predeterminada)',
          vertical: 'Vertical'
        },
        bar_color_mode: {
          auto: 'Automàtic',
          segment: 'Segments',
          rainbow: 'Arc de Sant Martí'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Cantonades arrodonides',
          glass: 'Vidre',
          gradient: 'Degradat',
          gradient_reverse: 'Degradat invers',
          shimmer: 'Resplendor',
          shimmer_reverse: 'Resplendor invers'
        },
        hide: {
          icon: 'Icona',
          name: 'Nom',
          value: 'Valor',
          unit: 'Unitat',
          secondary_info: 'Info',
          progress_bar: 'Barra'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  cs: {
    card: {
      msg: {
        appliedDefaultValue: 'Výchozí hodnota byla automaticky aplikována.',
        attributeNotFound: 'Atribut nebyl nalezen v HA.',
        entityNotFound: 'Entita nebyla nalezena v HA.',
        invalidActionObject: 'Objekt akce je neplatný nebo špatně strukturovaný.',
        invalidDecimal: 'Hodnota musí být platné desítkové číslo.',
        invalidEntityId: 'ID entity je neplatné nebo špatně formátované.',
        invalidEnumValue: 'Poskytnutá hodnota není jednou z povolených možností.',
        invalidStateContent: 'Obsah stavu je neplatný nebo špatně formátovaný.',
        invalidStateContentEntry: 'Jedna nebo více položek v obsahu stavu je neplatných.',
        invalidTheme: 'Zadaný motiv je neznámý. Bude použit výchozí motiv.',
        invalidTypeArray: 'Očekávána hodnota typu pole.',
        invalidTypeBoolean: 'Očekávána hodnota typu boolean.',
        invalidTypeNumber: 'Očekávána hodnota typu číslo.',
        invalidTypeObject: 'Očekávána hodnota typu objekt.',
        invalidTypeString: 'Očekávána hodnota typu řetězec.',
        invalidUnionType: 'Hodnota neodpovídá žádnému z povolených typů.',
        missingActionKey: 'V objektu akce chybí požadovaný klíč.',
        missingRequiredProperty: 'Chybí povinná vlastnost.'
      }
    },
    editor: {
      title: {
        content: 'Obsah',
        interaction: 'Interakce',
        theme: 'Vzhled a pocit'
      },
      field: {
        attribute: 'Atribut',
        badge_color: 'Barva odznaku',
        badge_icon: 'Ikona odznaku',
        bar_color: 'Barva lišty',
        bar_effect_jinja: 'Efekt na liště (režim Jinja)',
        bar_orientation: 'Orientace lišty',
        bar_position: 'Umístění lišty',
        bar_single_line: 'Info v jednom řádku',
        bar_size: 'Velikost lišty',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Barevný režim',
        bar_scale: 'Bar scale',
        center_zero: 'Nula uprostřed',
        center_zero_value: 'Hodnota středu',
        center_zero_growth_percent: 'Procento růstu',
        color: 'Hlavní barva',
        decimal: 'desetinný',
        double_tap_action: 'Chování při dvojitém klepnutí',
        entity: 'Entita',
        force_circular_background: 'Vynutit kruhové pozadí',
        hide_jinja: 'Skrýt (režim Jinja)',
        hold_action: 'Chování při podržení',
        icon: 'Ikona',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Chování při dvojitém klepnutí na ikonu',
        icon_hold_action: 'Chování při podržení ikony',
        icon_tap_action: 'Chování při klepnutí na ikonu',
        layout: 'Rozložení obsahu',
        max_value: 'Maximální hodnota',
        min_value: 'Minimální hodnota',
        name: 'Název',
        percent: 'Procento',
        reverse_secondary_info_row: 'Zaměnit lištu a text',
        secondary: 'Sekundární informace',
        state_content: 'Obsah stavu',
        show_all_actions: 'Zobrazit všechny akce',
        tap_action: 'Chování při klepnutí',
        text_shadow: 'Přidat stín textu',
        theme_mode: 'Theme mode',
        theme: 'Motiv',
        custom_theme: 'Custom theme zones',
        unit: 'Jednotka',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Vlastní sekundární info',
        multiline: 'Multiline',
        interpolate: 'Interpolace barev',
        name_info: 'Vlastní info názvu',
        reverse: 'Obrátit časovač',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Další entity',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimální při nízkých hodnotách (CPU, RAM...)',
          optimal_when_high: 'Optimální při vysokých hodnotách (Baterie...)',
          light: 'Světlo',
          temperature: 'Teplota',
          humidity: 'Vlhkost',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Malá',
          medium: 'Střední',
          large: 'Velká',
          xlarge: 'Extra velká'
        },
        bar_orientation: {
          ltr: 'Zleva doprava',
          rtl: 'Zprava doleva',
          up: 'Nahoru'
        },
        bar_position: {
          default: 'Výchozí',
          below: 'Lišta pod obsahem',
          top: 'Lišta nahoře',
          bottom: 'Lišta dole',
          overlay: 'Lišta přes obsah (overlay)',
          background: 'Pozadí karty'
        },
        layout: {
          horizontal: 'Horizontální (výchozí)',
          vertical: 'Vertikální'
        },
        bar_color_mode: {
          auto: 'Automaticky',
          segment: 'Segmenty',
          rainbow: 'Duha'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Zakulacené rohy',
          glass: 'Sklo',
          gradient: 'Přechod',
          gradient_reverse: 'Přechod obráceně',
          shimmer: 'Třpyt',
          shimmer_reverse: 'Třpyt obráceně'
        },
        hide: {
          icon: 'Ikona',
          name: 'Název',
          value: 'Hodnota',
          unit: 'Jednotka',
          secondary_info: 'Info',
          progress_bar: 'Lišta'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  da: {
    card: {
      msg: {
        appliedDefaultValue: 'Standardværdi er blevet anvendt automatisk.',
        attributeNotFound: 'Egenskab blev ikke fundet i Home Assistant.',
        entityNotFound: 'Enheden blev ikke fundet i Home Assistant.',
        invalidActionObject: 'Handlingsobjektet er ugyldigt eller forkert struktureret.',
        invalidDecimal: 'Værdien skal være et gyldigt decimaltal.',
        invalidEntityId: 'Enheds-ID er ugyldigt eller forkert formateret.',
        invalidEnumValue: 'Den angivne værdi er ikke en tilladt mulighed.',
        invalidStateContent: 'Tilstandsindholdet er ugyldigt eller fejlbehæftet.',
        invalidStateContentEntry: 'En eller flere poster i tilstandsindholdet er ugyldige.',
        invalidTheme: 'Det angivne tema er ukendt. Standardtema anvendes.',
        invalidTypeArray: 'Forventede en array-værdi.',
        invalidTypeBoolean: 'Forventede en boolesk værdi.',
        invalidTypeNumber: 'Forventede en numerisk værdi.',
        invalidTypeObject: 'Forventede en objektværdi.',
        invalidTypeString: 'Forventede en strengværdi.',
        invalidUnionType: 'Værdien matcher ingen af de tilladte typer.',
        missingActionKey: 'En påkrævet nøgle mangler i handlingsobjektet.',
        missingRequiredProperty: 'En påkrævet egenskab mangler.'
      }
    },
    editor: {
      title: {
        content: 'Indhold',
        interaction: 'Interaktioner',
        theme: 'Udseende og funktionalitet'
      },
      field: {
        attribute: 'Attribut',
        badge_color: 'Badge-farve',
        badge_icon: 'Badge-ikon',
        bar_color: 'Farve til bar',
        bar_effect_jinja: 'Effekt på bar (Jinja-tilstand)',
        bar_orientation: 'Bar-retning',
        bar_position: 'Bar-placering',
        bar_single_line: 'Info på én linje',
        bar_size: 'Bar størrelse',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Farvetilstand',
        bar_scale: 'Bar scale',
        center_zero: 'Center nul',
        center_zero_value: 'Centerværdi',
        center_zero_growth_percent: 'Vækstprocent',
        color: 'Primær farve',
        decimal: 'decimal',
        double_tap_action: 'Handling ved dobbelt tryk',
        entity: 'Enhed',
        force_circular_background: 'Tving cirkulær baggrund',
        hide_jinja: 'Skjul (Jinja-tilstand)',
        hold_action: 'Handling ved langt tryk',
        icon: 'Ikon',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Handling ved dobbelt tryk på ikonet',
        icon_hold_action: 'Handling ved langt tryk på ikonet',
        icon_tap_action: 'Handling ved tryk på ikonet',
        layout: 'Indholdslayout',
        max_value: 'Maksimal værdi',
        min_value: 'Minimumsværdi',
        name: 'Navn',
        percent: 'Procent',
        reverse_secondary_info_row: 'Skift bjælke og tekst',
        secondary: 'Sekundær info',
        state_content: 'Indhold af tilstand',
        show_all_actions: 'Vis alle handlinger',
        tap_action: 'Handling ved kort tryk',
        text_shadow: 'Tilføj tekstskygge',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Custom theme zones',
        unit: 'Enhed',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Tilpasset sekundær info',
        multiline: 'Multiline',
        interpolate: 'Interpoler farver',
        name_info: 'Tilpasset navneinfo',
        reverse: 'Omvendt timer',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Ekstra entiteter',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimal når lavt (CPU, RAM,...)',
          optimal_when_high: 'Optimal når højt (Batteri...)',
          light: 'Lys',
          temperature: 'Temperatur',
          humidity: 'Fugtighed',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Lille',
          medium: 'Medium',
          large: 'Stor',
          xlarge: 'Ekstra stor'
        },
        bar_orientation: {
          ltr: 'Venstre til højre',
          rtl: 'Højre til venstre',
          up: 'Opad'
        },
        bar_position: {
          default: 'Standard',
          below: 'Bar under indhold',
          top: 'Bar øverst',
          bottom: 'Bar nederst',
          overlay: 'Bar over indhold (overlay)',
          background: 'Kortbaggrund'
        },
        layout: {
          horizontal: 'Horisontal (standard)',
          vertical: 'Vertikal'
        },
        bar_color_mode: {
          auto: 'Auto',
          segment: 'Segmenter',
          rainbow: 'Regnbue'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Afrundede hjørner',
          glass: 'Glas',
          gradient: 'Gradient',
          gradient_reverse: 'Omvendt gradient',
          shimmer: 'Glans',
          shimmer_reverse: 'Omvendt glans'
        },
        hide: {
          icon: 'Ikon',
          name: 'Navn',
          value: 'Værdi',
          unit: 'Enhed',
          secondary_info: 'Info',
          progress_bar: 'Bjælke'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  de: {
    card: {
      msg: {
        appliedDefaultValue: 'Ein Standardwert wurde automatisch angewendet.',
        attributeNotFound: 'Attribut in Home Assistant nicht gefunden.',
        entityNotFound: 'Entität in Home Assistant nicht gefunden.',
        invalidActionObject: 'Das Aktionsobjekt ist ungültig oder falsch strukturiert.',
        invalidDecimal: 'Der Wert muss eine gültige Dezimalzahl sein.',
        invalidEntityId: 'Die Entity-ID ist ungültig oder fehlerhaft.',
        invalidEnumValue: 'Der angegebene Wert gehört nicht zu den erlaubten Optionen.',
        invalidStateContent: 'Der Statusinhalt ist ungültig oder fehlerhaft.',
        invalidStateContentEntry: 'Ein oder mehrere Einträge im Statusinhalt sind ungültig.',
        invalidTheme: 'Das angegebene Theme ist unbekannt. Das Standard-Theme wird verwendet.',
        invalidTypeArray: 'Ein Wert vom Typ Array wurde erwartet.',
        invalidTypeBoolean: 'Ein Wert vom Typ Boolesch wurde erwartet.',
        invalidTypeNumber: 'Ein Wert vom Typ Zahl wurde erwartet.',
        invalidTypeObject: 'Ein Wert vom Typ Objekt wurde erwartet.',
        invalidTypeString: 'Ein Wert vom Typ Zeichenkette wurde erwartet.',
        invalidUnionType: 'Der Wert entspricht keinem der erlaubten Typen.',
        missingActionKey: 'Ein erforderlicher Schlüssel fehlt im Aktionsobjekt.',
        missingRequiredProperty: 'Eine erforderliche Eigenschaft fehlt.'
      }
    },
    editor: {
      title: {
        content: 'Inhalt',
        interaction: 'Interaktionen',
        theme: 'Aussehen und Bedienung'
      },
      field: {
        attribute: 'Attribut',
        badge_color: 'Farbe des Badges',
        badge_icon: 'Symbol des Badges',
        bar_color: 'Balkenfarbe',
        bar_effect_jinja: 'Effekt auf die Leiste (Jinja-Modus)',
        bar_orientation: 'Ausrichtung der Leiste',
        bar_position: 'Position der Leiste',
        bar_single_line: 'Informationen in einer Zeile',
        bar_size: 'Größe der Bar',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Balkenfarbmodus',
        bar_scale: 'Balkenskala',
        center_zero: 'Null in der Mitte',
        center_zero_value: 'Zentrumswert',
        center_zero_growth_percent: 'Wachstumsprozentsatz',
        color: 'Symbolfarbe',
        decimal: 'dezimal',
        double_tap_action: 'Aktion bei doppelt Tippen',
        entity: 'Entität',
        force_circular_background: 'Kreisförmigen Hintergrund erzwingen',
        hide_jinja: 'Ausblenden (Jinja-Modus)',
        hold_action: 'Aktion bei langem Tippen',
        icon: 'Symbol',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Aktion bei doppelt Tippen auf das Symbol',
        icon_hold_action: 'Aktion bei langem Tippen auf das Symbol',
        icon_tap_action: 'Aktion beim Tippen auf das Symbol',
        layout: 'Inhaltslayout',
        max_value: 'Höchstwert',
        min_value: 'Mindestwert',
        name: 'Name',
        percent: 'Prozent',
        reverse_secondary_info_row: 'Barra und Text tauschen',
        secondary: 'Sekundäre Informationen',
        state_content: 'Statusinhalt',
        show_all_actions: 'Alle Aktionen anzeigen',
        tap_action: 'Aktion bei kurzem Tippen',
        text_shadow: 'Textschatten hinzufügen',
        theme_mode: 'Theme mode',
        theme: 'Thema',
        custom_theme: 'Benutzerdefinierte Themenzonen',
        unit: 'Einheit',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Zusatzinfo (sekundär)',
        multiline: 'Mehrzeilig',
        interpolate: 'Farben interpolieren',
        name_info: 'Zusatzinfo (Name)',
        reverse: 'Timer umkehren',
        bar_stack_mode: 'Stapelmodus',
        bar_stack: 'Weitere Entitäten',
        migrate_config: 'Konfiguration migrieren'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimal bei niedrig (CPU, RAM,...)',
          optimal_when_high: 'Optimal bei hoch (Batterie...)',
          light: 'Licht',
          temperature: 'Temperatur',
          humidity: 'Feuchtigkeit',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Klein',
          medium: 'Mittel',
          large: 'Groß',
          xlarge: 'Extra groß'
        },
        bar_orientation: {
          ltr: 'Von links nach rechts',
          rtl: 'Von rechts nach links',
          up: 'Nach oben'
        },
        bar_position: {
          default: 'Standard',
          below: 'Leiste unter dem Inhalt',
          top: 'Leiste oben',
          bottom: 'Leiste unten',
          overlay: 'Leiste über dem Inhalt (Overlay)',
          background: 'Kartenhintergrund'
        },
        layout: {
          horizontal: 'Horizontal (Standard)',
          vertical: 'Vertikal'
        },
        bar_color_mode: {
          auto: 'Automatisch',
          segment: 'Segmente',
          rainbow: 'Regenbogen'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmisch'
        },
        bar_effect: {
          radius: 'Abgerundete Ecken',
          glass: 'Glas',
          gradient: 'Verlauf',
          gradient_reverse: 'Verlauf umgekehrt',
          shimmer: 'Schimmer',
          shimmer_reverse: 'Schimmer umgekehrt'
        },
        hide: {
          icon: 'Symbol',
          name: 'Name',
          value: 'Wert',
          unit: 'Einheit',
          secondary_info: 'Info',
          progress_bar: 'Balken'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Unterer Wert',
          high: 'Oberer Wert',
          type: 'Typ',
          opacity: 'Deckkraft',
          low_color: 'Untere Farbe',
          high_color: 'Obere Farbe',
          low_as: 'Einheit (unterer Wert)',
          high_as: 'Einheit (oberer Wert)',
          line_size: 'Linienstärke',
          disable_low: 'Unteren Wert deaktivieren',
          disable_high: 'Oberen Wert deaktivieren',
          low_attribute: 'Attribut',
          high_attribute: 'Attribut'
        },
        icon_animation: {
          none: 'Keine',
          spin: 'Drehen',
          pulse: 'Pulsieren',
          bounce: 'Hüpfen',
          shake: 'Wackeln',
          ping: 'Ping',
          reveal: 'Einblenden',
          washing_machine: 'Waschmaschine',
          battery_charging: 'Akku lädt'
        },
        alert_when: {
          above: 'Alarm über',
          below: 'Alarm unter',
          color: 'Alarmfarbe',
          highlight: 'Hervorhebung',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Rahmen',
          background: 'Hintergrund'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fester Wert',
          entity: 'Entität',
          jinja: 'Vorlage'
        },
        max_value_mode: {
          standard: 'Fester Wert',
          entity: 'Entität',
          jinja: 'Vorlage'
        },
        watermark_low_mode: {
          standard: 'Fester Wert',
          entity: 'Entität',
          jinja: 'Vorlage'
        },
        watermark_high_mode: {
          standard: 'Fester Wert',
          entity: 'Entität',
          jinja: 'Vorlage'
        },
        theme_mode: {
          preset: 'Voreinstellung',
          custom: 'Benutzerdefiniert'
        },
        min_value: {
          attribute: 'Attribut'
        },
        max_value: {
          attribute: 'Attribut'
        },
        bar_stack_mode: {
          stacked: 'Gestapelt',
          proportional: 'Proportional',
          net: 'Netto'
        }
      }
    }
  },
  el: {
    card: {
      msg: {
        appliedDefaultValue: 'Εφαρμόστηκε αυτόματα προεπιλεγμένη τιμή.',
        attributeNotFound: 'Το χαρακτηριστικό δεν βρέθηκε στο Home Assistant.',
        entityNotFound: 'Η οντότητα δεν βρέθηκε στο Home Assistant.',
        invalidActionObject: 'Το αντικείμενο ενέργειας δεν είναι έγκυρο ή είναι κακώς δομημένο.',
        invalidDecimal: 'Η τιμή πρέπει να είναι έγκυρος δεκαδικός αριθμός.',
        invalidEntityId: 'Το αναγνωριστικό οντότητας δεν είναι έγκυρο ή είναι κακώς διαμορφωμένο.',
        invalidEnumValue: 'Η παρεχόμενη τιμή δεν είναι αποδεκτή επιλογή.',
        invalidStateContent: 'Το περιεχόμενο κατάστασης δεν είναι έγκυρο ή είναι κακώς διαμορφωμένο.',
        invalidStateContentEntry: 'Μία ή περισσότερες καταχωρήσεις στο περιεχόμενο κατάστασης είναι άκυρες.',
        invalidTheme: 'Το καθορισμένο θέμα είναι άγνωστο. Θα χρησιμοποιηθεί το προεπιλεγμένο θέμα.',
        invalidTypeArray: 'Αναμενόταν τιμή τύπου πίνακα.',
        invalidTypeBoolean: 'Αναμενόταν τιμή τύπου boolean.',
        invalidTypeNumber: 'Αναμενόταν τιμή τύπου αριθμού.',
        invalidTypeObject: 'Αναμενόταν τιμή τύπου αντικειμένου.',
        invalidTypeString: 'Αναμενόταν τιμή τύπου συμβολοσειράς.',
        invalidUnionType: 'Η τιμή δεν ταιριάζει σε κανέναν από τους επιτρεπόμενους τύπους.',
        missingActionKey: 'Λείπει απαιτούμενο κλειδί στο αντικείμενο ενέργειας.',
        missingRequiredProperty: 'Λείπει μια απαιτούμενη ιδιότητα.'
      }
    },
    editor: {
      title: {
        content: 'Περιεχόμενο',
        interaction: 'Αλληλεπιδράσεις',
        theme: 'Εμφάνιση'
      },
      field: {
        attribute: 'Χαρακτηριστικό',
        badge_color: 'Χρώμα εμβλήματος',
        badge_icon: 'Εικονίδιο εμβλήματος',
        bar_color: 'Χρώμα γραμμής',
        bar_effect_jinja: 'Εφέ γραμμής (λειτουργία Jinja)',
        bar_orientation: 'Κατεύθυνση γραμμής',
        bar_position: 'Θέση γραμμής',
        bar_single_line: 'Πληροφορίες σε μία γραμμή',
        bar_size: 'Μέγεθος γραμμής',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Λειτουργία χρώματος',
        bar_scale: 'Bar scale',
        center_zero: 'Μηδέν στο κέντρο',
        center_zero_value: 'Τιμή κέντρου',
        center_zero_growth_percent: 'Ποσοστό μεταβολής',
        color: 'Κύριο χρώμα',
        decimal: 'δεκαδικά',
        double_tap_action: 'Ενέργεια κατά το διπλό πάτημα',
        entity: 'Οντότητα',
        force_circular_background: 'Εξαναγκασμός κυκλικού φόντου',
        hide_jinja: 'Απόκρυψη (λειτουργία Jinja)',
        hold_action: 'Ενέργεια κατά το παρατεταμένο πάτημα',
        icon: 'Εικονίδιο',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Ενέργεια στο διπλό πάτημα του εικονιδίου',
        icon_hold_action: 'Ενέργεια στο παρατεταμένο πάτημα του εικονιδίου',
        icon_tap_action: 'Ενέργεια στο πάτημα του εικονιδίου',
        layout: 'Διάταξη περιεχομένου',
        max_value: 'Μέγιστη τιμή',
        min_value: 'Ελάχιστη τιμή',
        name: 'Όνομα',
        percent: 'Ποσοστό',
        reverse_secondary_info_row: 'Εναλλαγή γραμμής και κειμένου',
        secondary: 'Πρόσθετες πληροφορίες',
        state_content: 'Περιεχόμενο κατάστασης',
        show_all_actions: 'Εμφάνιση όλων των ενεργειών',
        tap_action: 'Ενέργεια κατά το σύντομο πάτημα',
        text_shadow: 'Προσθήκη σκιάς στο κείμενο',
        theme_mode: 'Theme mode',
        theme: 'Θέμα',
        custom_theme: 'Custom theme zones',
        unit: 'Μονάδα',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Προσαρμοσμένη δευτερεύουσα πληροφορία',
        multiline: 'Multiline',
        interpolate: 'Παρεμβολή χρωμάτων',
        name_info: 'Προσαρμοσμένη πληροφορία ονόματος',
        reverse: 'Αντίστροφο χρονόμετρο',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Πρόσθετες οντότητες',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Βέλτιστο όταν είναι χαμηλό (CPU, RAM...)',
          optimal_when_high: 'Βέλτιστο όταν είναι υψηλό (Μπαταρία...)',
          light: 'Φωτεινότητα',
          temperature: 'Θερμοκρασία',
          humidity: 'Υγρασία',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Μικρή',
          medium: 'Μεσαία',
          large: 'Μεγάλη',
          xlarge: 'Πολύ μεγάλη'
        },
        bar_orientation: {
          ltr: 'Από αριστερά προς δεξιά',
          rtl: 'Από δεξιά προς αριστερά',
          up: 'Προς τα πάνω'
        },
        bar_position: {
          default: 'Προεπιλογή',
          below: 'Γραμμή κάτω από το περιεχόμενο',
          top: 'Γραμμή πάνω',
          bottom: 'Γραμμή κάτω',
          overlay: 'Γραμμή πάνω από περιεχόμενο (overlay)',
          background: 'Φόντο κάρτας'
        },
        layout: {
          horizontal: 'Οριζόντια (προεπιλογή)',
          vertical: 'Κατακόρυφη'
        },
        bar_color_mode: {
          auto: 'Αυτόματο',
          segment: 'Τμήματα',
          rainbow: 'Ουράνιο τόξο'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Στρογγυλεμένες γωνίες',
          glass: 'Γυαλί',
          gradient: 'Ντεγκραντέ',
          gradient_reverse: 'Ντεγκραντέ αντίστροφο',
          shimmer: 'Αχτινοβολία',
          shimmer_reverse: 'Αχτινοβολία αντίστροφη'
        },
        hide: {
          icon: 'Εικονίδιο',
          name: 'Όνομα',
          value: 'Τιμή',
          unit: 'Μονάδα',
          secondary_info: 'Πληροφορίες',
          progress_bar: 'Μπάρα'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  en: {
    card: {
      msg: {
        appliedDefaultValue: 'A default value has been applied automatically.',
        attributeNotFound: 'Attribute not found in HA.',
        entityNotFound: 'Entity not found in HA.',
        invalidActionObject: 'The action object is invalid or improperly structured.',
        invalidDecimal: 'The value must be a valid decimal number.',
        invalidEntityId: 'The entity ID is invalid or malformed.',
        invalidEnumValue: 'The provided value is not one of the allowed options.',
        invalidStateContent: 'The state content is invalid or malformed.',
        invalidStateContentEntry: 'One or more entries in the state content are invalid.',
        invalidTheme: 'The specified theme is unknown. Default theme will be used.',
        invalidTypeArray: 'Expected a value of type array.',
        invalidTypeBoolean: 'Expected a value of type boolean.',
        invalidTypeNumber: 'Expected a value of type number.',
        invalidTypeObject: 'Expected a value of type object.',
        invalidTypeString: 'Expected a value of type string.',
        invalidUnionType: 'The value does not match any of the allowed types.',
        missingActionKey: 'A required key is missing in the action object.',
        missingRequiredProperty: 'Required property is missing.'
      }
    },
    editor: {
      title: {
        content: 'Content',
        interaction: 'Interactions',
        theme: 'Look & Feel'
      },
      field: {
        attribute: 'Attribute',
        badge_color: 'Badge color',
        badge_icon: 'Badge icon',
        bar_color: 'Bar color',
        bar_effect_jinja: 'Bar effect (Jinja mode)',
        bar_orientation: 'Bar orientation',
        bar_position: 'Bar position',
        bar_single_line: 'Single line info',
        bar_size: 'Bar size',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Bar color mode',
        bar_scale: 'Bar scale',
        center_zero: 'Zero at center',
        center_zero_value: 'Center value',
        center_zero_growth_percent: 'Growth percentage',
        color: 'Icon color',
        decimal: 'decimal',
        double_tap_action: 'Double tap behavior',
        entity: 'Entity',
        force_circular_background: 'Force icon circular background',
        hide_jinja: 'Hide (Jinja mode)',
        hold_action: 'Hold behavior',
        icon: 'Icon',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Icon double tap behavior',
        icon_hold_action: 'Icon hold behavior',
        icon_tap_action: 'Icon tap behavior',
        layout: 'Content layout',
        max_value: 'Maximum value',
        min_value: 'Minimum value',
        name: 'Name',
        percent: 'Percentage',
        reverse_secondary_info_row: 'Swap bar and text',
        secondary: 'Secondary info',
        state_content: 'State content',
        show_all_actions: 'Show all interactions',
        tap_action: 'Tap behavior',
        text_shadow: 'Add text shadow',
        theme_mode: 'Theme mode',
        theme: 'Theme',
        custom_theme: 'Custom theme zones',
        unit: 'Unit',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Custom secondary info',
        multiline: 'Multiline',
        interpolate: 'Interpolate colors',
        name_info: 'Custom name info',
        reverse: 'Reverse timer',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Additional entities',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimal when Low (CPU, RAM,...)',
          optimal_when_high: 'Optimal when High (Battery...)',
          light: 'Light',
          temperature: 'Temperature',
          humidity: 'Humidity',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Small',
          medium: 'Medium',
          large: 'Large',
          xlarge: 'Extra Large'
        },
        bar_orientation: {
          ltr: 'Left to Right',
          rtl: 'Right to Left',
          up: 'Up'
        },
        bar_position: {
          default: 'Default',
          below: 'Bar below content',
          top: 'Bar on top',
          bottom: 'Bar on bottom',
          overlay: 'Bar overlay on content',
          background: 'Full card background'
        },
        layout: {
          horizontal: 'Horizontal (default)',
          vertical: 'Vertical'
        },
        bar_color_mode: {
          auto: 'Auto',
          segment: 'Segment',
          rainbow: 'Rainbow'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Rounded corners',
          glass: 'Glass',
          gradient: 'Gradient',
          gradient_reverse: 'Gradient reverse',
          shimmer: 'Shimmer',
          shimmer_reverse: 'Shimmer reverse'
        },
        hide: {
          icon: 'Icon',
          name: 'Name',
          value: 'Value',
          unit: 'Unit',
          secondary_info: 'Secondary info',
          progress_bar: 'Bar'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Proportional',
          net: 'Net'
        }
      }
    }
  },
  'es-419': {
    card: {
      msg: {
        appliedDefaultValue: 'Se aplicó automáticamente el valor predeterminado.',
        attributeNotFound: 'No se encontró el atributo en Home Assistant.',
        entityNotFound: 'No se encontró la entidad en Home Assistant.',
        invalidActionObject: 'Objeto de acción inválido o mal estructurado.',
        invalidDecimal: 'El valor debe ser un decimal válido.',
        invalidEntityId: 'ID de entidad inválido o mal formado.',
        invalidEnumValue: 'El valor proporcionado no está dentro de las opciones permitidas.',
        invalidStateContent: 'Contenido del estado inválido o mal formado.',
        invalidStateContentEntry: 'Uno o más elementos del contenido del estado son inválidos.',
        invalidTheme: 'El tema especificado es desconocido; se usará el tema predeterminado.',
        invalidTypeArray: 'Se esperaba un valor de tipo arreglo.',
        invalidTypeBoolean: 'Se esperaba un valor de tipo booleano.',
        invalidTypeNumber: 'Se esperaba un valor de tipo numérico.',
        invalidTypeObject: 'Se esperaba un valor de tipo objeto.',
        invalidTypeString: 'Se esperaba un valor de tipo cadena.',
        invalidUnionType: 'El valor no coincide con ningún tipo permitido.',
        missingActionKey: 'Falta una clave obligatoria en el objeto de acción.',
        missingRequiredProperty: 'Falta una propiedad obligatoria.'
      }
    },
    editor: {
      title: {
        content: 'Contenido',
        interaction: 'Interacción',
        theme: 'Apariencia y tema'
      },
      field: {
        attribute: 'Atributo',
        badge_color: 'Color del distintivo',
        badge_icon: 'Ícono del distintivo',
        bar_color: 'Color de la barra de progreso',
        bar_effect_jinja: 'Efecto de la barra de progreso (modo Jinja)',
        bar_orientation: 'Orientación de la barra',
        bar_position: 'Posición de la barra',
        bar_single_line: 'Información en línea',
        bar_size: 'Tamaño de la barra',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Modo de color',
        bar_scale: 'Bar scale',
        center_zero: 'Cero centrado',
        center_zero_value: 'Valor de centrado',
        center_zero_growth_percent: 'Porcentaje de crecimiento',
        color: 'Color principal',
        decimal: 'Decimal',
        double_tap_action: 'Acción al doble toque',
        entity: 'Entidad',
        force_circular_background: 'Forzar fondo circular',
        hide_jinja: 'Ocultar (modo Jinja)',
        hold_action: 'Acción al mantener presionado',
        icon: 'Ícono',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Acción de doble toque en ícono',
        icon_hold_action: 'Acción al mantener presionado ícono',
        icon_tap_action: 'Acción al tocar ícono',
        layout: 'Disposición del contenido',
        max_value: 'Valor máximo',
        min_value: 'Valor mínimo',
        name: 'Nombre',
        percent: 'Porcentaje',
        reverse_secondary_info_row: 'Intercambiar barra y texto',
        secondary: 'Información secundaria',
        state_content: 'Contenido del estado',
        show_all_actions: 'Mostrar todas las acciones',
        tap_action: 'Acción al tocar',
        text_shadow: 'Agregar sombra al texto',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Custom theme zones',
        unit: 'Unidad',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Info secundaria personalizada',
        multiline: 'Multiline',
        interpolate: 'Interpolación de colores',
        name_info: 'Info de nombre personalizada',
        reverse: 'Temporizador inverso',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Entidades adicionales',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Óptimo cuando es bajo (CPU, RAM…)',
          optimal_when_high: 'Óptimo cuando es alto (batería…)',
          light: 'Brillo',
          temperature: 'Temperatura',
          humidity: 'Humedad',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Pequeña',
          medium: 'Mediana',
          large: 'Grande',
          xlarge: 'Extra grande'
        },
        bar_orientation: {
          ltr: 'De izquierda a derecha',
          rtl: 'De derecha a izquierda',
          up: 'Hacia arriba'
        },
        bar_position: {
          default: 'Predeterminado',
          below: 'Barra debajo del contenido',
          top: 'Barra arriba',
          bottom: 'Barra abajo',
          overlay: 'Superpuesta sobre el contenido',
          background: 'Fondo de la tarjeta'
        },
        layout: {
          horizontal: 'Horizontal (predeterminado)',
          vertical: 'Vertical'
        },
        bar_color_mode: {
          auto: 'Auto',
          segment: 'Segmentos',
          rainbow: 'Arcoíris'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Esquinas redondeadas',
          glass: 'Vidrio',
          gradient: 'Degradado',
          gradient_reverse: 'Degradado inverso',
          shimmer: 'Destello',
          shimmer_reverse: 'Destello inverso'
        },
        hide: {
          icon: 'Icono',
          name: 'Nombre',
          value: 'Valor',
          unit: 'Unidad',
          secondary_info: 'Info',
          progress_bar: 'Barra'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  es: {
    card: {
      msg: {
        appliedDefaultValue: 'Se ha aplicado un valor predeterminado automáticamente.',
        attributeNotFound: 'Atributo no encontrado en Home Assistant.',
        entityNotFound: 'Entidad no encontrada en Home Assistant.',
        invalidActionObject: 'El objeto de acción es inválido o está mal estructurado.',
        invalidDecimal: 'El valor debe ser un número decimal válido.',
        invalidEntityId: 'El ID de la entidad no es válido o está mal formado.',
        invalidEnumValue: 'El valor proporcionado no es una opción válida.',
        invalidStateContent: 'El contenido del estado es inválido o está mal formado.',
        invalidStateContentEntry: 'Una o más entradas en el contenido del estado son inválidas.',
        invalidTheme: 'El tema especificado es desconocido. Se usará el tema por defecto.',
        invalidTypeArray: 'Se esperaba un valor de tipo arreglo.',
        invalidTypeBoolean: 'Se esperaba un valor de tipo booleano.',
        invalidTypeNumber: 'Se esperaba un valor de tipo número.',
        invalidTypeObject: 'Se esperaba un valor de tipo objeto.',
        invalidTypeString: 'Se esperaba un valor de tipo cadena.',
        invalidUnionType: 'El valor no coincide con ninguno de los tipos permitidos.',
        missingActionKey: 'Falta una clave obligatoria en el objeto de acción.',
        missingRequiredProperty: 'Falta una propiedad obligatoria.'
      }
    },
    editor: {
      title: {
        content: 'Contenido',
        interaction: 'Interacciones',
        theme: 'Apariencia y funcionamiento'
      },
      field: {
        attribute: 'Atributo',
        badge_color: 'Color del badge',
        badge_icon: 'Icono del badge',
        bar_color: 'Color de la barra',
        bar_effect_jinja: 'Efecto de la barra (modo Jinja)',
        bar_orientation: 'Orientación de la barra',
        bar_position: 'Posición de la barra',
        bar_single_line: 'Información en una sola línea',
        bar_size: 'Tamaño de la barra',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Modo de color de la barra',
        bar_scale: 'Escala de la barra',
        center_zero: 'Cero en el centro',
        center_zero_value: 'Valor de centrado',
        center_zero_growth_percent: 'Porcentaje de crecimiento',
        color: 'Color del icono',
        decimal: 'decimal',
        double_tap_action: 'Acción al pulsar dos veces',
        entity: 'Entidad',
        force_circular_background: 'Forzar fondo circular',
        hide_jinja: 'Ocultar (modo Jinja)',
        hold_action: 'Acción al mantener pulsado',
        icon: 'Icono',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Acción al pulsar dos veces el icono',
        icon_hold_action: 'Acción al mantener pulsado el icono',
        icon_tap_action: 'Acción al pulsar el icono',
        layout: 'Disposición del contenido',
        max_value: 'Valor máximo',
        min_value: 'Valor mínimo',
        name: 'Nombre',
        percent: 'Porcentaje',
        reverse_secondary_info_row: 'Intercambiar barra y texto',
        secondary: 'Información secundaria',
        state_content: 'Contenido del estado',
        show_all_actions: 'Mostrar todas las acciones',
        tap_action: 'Acción al pulsar brevemente',
        text_shadow: 'Añadir sombra al texto',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Zonas de tema personalizado',
        unit: 'Unidad',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Info secundaria personalizada',
        multiline: 'Multilínea',
        interpolate: 'Interpolación de colores',
        name_info: 'Info de nombre personalizada',
        reverse: 'Temporizador inverso',
        bar_stack_mode: 'Modo de apilado',
        bar_stack: 'Entidades adicionales',
        migrate_config: 'Migrar configuración'
      },
      option: {
        theme: {
          optimal_when_low: 'Óptimo cuando es bajo (CPU, RAM,...)',
          optimal_when_high: 'Óptimo cuando es alto (Batería...)',
          light: 'Luz',
          temperature: 'Temperatura',
          humidity: 'Humedad',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Pequeña',
          medium: 'Mediana',
          large: 'Grande',
          xlarge: 'Extra grande'
        },
        bar_orientation: {
          ltr: 'De izquierda a derecha',
          rtl: 'De derecha a izquierda',
          up: 'Hacia arriba'
        },
        bar_position: {
          default: 'Predeterminado',
          below: 'Barra debajo del contenido',
          top: 'Barra arriba',
          bottom: 'Barra abajo',
          overlay: 'Barra superpuesta al contenido (overlay)',
          background: 'Fondo de la tarjeta'
        },
        layout: {
          horizontal: 'Horizontal (predeterminado)',
          vertical: 'Vertical'
        },
        bar_color_mode: {
          auto: 'Auto',
          segment: 'Segmentos',
          rainbow: 'Arcoíris'
        },
        bar_scale: {
          linear: 'Lineal',
          log: 'Logarítmica'
        },
        bar_effect: {
          radius: 'Esquinas redondeadas',
          glass: 'Vidrio',
          gradient: 'Degradado',
          gradient_reverse: 'Degradado inverso',
          shimmer: 'Destello',
          shimmer_reverse: 'Destello inverso'
        },
        hide: {
          icon: 'Icono',
          name: 'Nombre',
          value: 'Valor',
          unit: 'Unidad',
          secondary_info: 'Info',
          progress_bar: 'Barra'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Umbral bajo',
          high: 'Umbral alto',
          type: 'Tipo',
          opacity: 'Opacidad',
          low_color: 'Color del umbral bajo',
          high_color: 'Color del umbral alto',
          low_as: 'Unidad (umbral bajo)',
          high_as: 'Unidad (umbral alto)',
          line_size: 'Grosor de línea',
          disable_low: 'Desactivar umbral bajo',
          disable_high: 'Desactivar umbral alto',
          low_attribute: 'Atributo',
          high_attribute: 'Atributo'
        },
        icon_animation: {
          none: 'Ninguna',
          spin: 'Girar',
          pulse: 'Pulso',
          bounce: 'Rebote',
          shake: 'Vibración',
          ping: 'Ping',
          reveal: 'Revelar',
          washing_machine: 'Lavadora',
          battery_charging: 'Batería cargando'
        },
        alert_when: {
          above: 'Alerta por encima de',
          below: 'Alerta por debajo de',
          color: 'Color de alerta',
          highlight: 'Resaltado',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Borde',
          background: 'Fondo'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Valor fijo',
          entity: 'Entidad',
          jinja: 'Plantilla'
        },
        max_value_mode: {
          standard: 'Valor fijo',
          entity: 'Entidad',
          jinja: 'Plantilla'
        },
        watermark_low_mode: {
          standard: 'Valor fijo',
          entity: 'Entidad',
          jinja: 'Plantilla'
        },
        watermark_high_mode: {
          standard: 'Valor fijo',
          entity: 'Entidad',
          jinja: 'Plantilla'
        },
        theme_mode: {
          preset: 'Preestablecido',
          custom: 'Personalizado'
        },
        min_value: {
          attribute: 'Atributo'
        },
        max_value: {
          attribute: 'Atributo'
        },
        bar_stack_mode: {
          stacked: 'Apilado',
          proportional: 'Proporcional',
          net: 'Neto'
        }
      }
    }
  },
  et: {
    card: {
      msg: {
        appliedDefaultValue: 'Vaikimisi väärtus rakendati automaatselt.',
        attributeNotFound: 'Atribuut ei leitud Home Assistantis.',
        entityNotFound: 'Objekti ei leitud Home Assistantis.',
        invalidActionObject: 'Tegevuse objekt on vigane või valesti struktureeritud.',
        invalidDecimal: 'Väärtus peab olema positiivne täisarv.',
        invalidEntityId: 'Objekti ID on vigane või valesti vormistatud.',
        invalidEnumValue: 'Antud väärtus ei kuulu lubatud valikute hulka.',
        invalidStateContent: 'Seisundi sisu on vigane või valesti vormistatud.',
        invalidStateContentEntry: 'Üks või mitu seisundi sisu kirjet on vigased.',
        invalidTheme: 'Määratud teema on tundmatu. Kasutatakse vaikimisi teemat.',
        invalidTypeArray: 'Oodati massiivi tüüpi väärtust.',
        invalidTypeBoolean: 'Oodati loogilist (boolean) tüüpi väärtust.',
        invalidTypeNumber: 'Oodati numbri tüüpi väärtust.',
        invalidTypeObject: 'Oodati objekti tüüpi väärtust.',
        invalidTypeString: 'Oodati stringi tüüpi väärtust.',
        invalidUnionType: 'Väärtus ei vasta ühelegi lubatud tüübile.',
        missingActionKey: 'Tegevuse objektist puudub kohustuslik võti.',
        missingRequiredProperty: 'Puudub kohustuslik atribuut.'
      }
    },
    editor: {
      title: {
        content: 'Sisu',
        interaction: 'Interaktsioonid',
        theme: 'Välimus ja kasutatavus'
      },
      field: {
        attribute: 'Atribuut',
        badge_color: 'Märgi värv',
        badge_icon: 'Märgi ikoon',
        bar_color: 'Riba värv',
        bar_effect_jinja: 'Riba efekt (Jinja režiim)',
        bar_orientation: 'Riba orientatsioon',
        bar_position: 'Riba positsioon',
        bar_single_line: 'Info ühel real',
        bar_size: 'Riba suurus',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Värvirežiim',
        bar_scale: 'Bar scale',
        center_zero: 'Null keskel',
        center_zero_value: 'Keskväärtus',
        center_zero_growth_percent: 'Kasvuprotsent',
        color: 'Ikooni värv',
        decimal: 'Kümnendkoht',
        double_tap_action: 'Topeltpuudutuse tegevus',
        entity: 'Objekt',
        force_circular_background: 'Sunnitud ümmargune taust',
        hide_jinja: 'Peida (Jinja režiim)',
        hold_action: 'Pikema vajutuse tegevus',
        icon: 'Ikoon',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Ikooni topeltpuudutuse tegevus',
        icon_hold_action: 'Ikooni pika vajutuse tegevus',
        icon_tap_action: 'Ikooni puudutuse tegevus',
        layout: 'Sisu paigutus',
        max_value: 'Maksimaalne väärtus',
        min_value: 'Minimaalne väärtus',
        name: 'Nimi',
        percent: 'Protsent',
        reverse_secondary_info_row: 'Vaheta riba ja tekst',
        secondary: 'Täiendav info',
        state_content: 'Oleku sisu',
        show_all_actions: 'Kuva kõik toimingud',
        tap_action: 'Puudutuse tegevus',
        text_shadow: 'Lisa teksti vari',
        theme_mode: 'Theme mode',
        theme: 'Teema',
        custom_theme: 'Custom theme zones',
        unit: 'Ühik',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Kohandatud sekundaarne teave',
        multiline: 'Multiline',
        interpolate: 'Värvide interpoleerimine',
        name_info: 'Kohandatud nime teave',
        reverse: 'Pööratud taimer',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Täiendavad üksused',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimaalne madalatel väärtustel (CPU, RAM...)',
          optimal_when_high: 'Optimaalne kõrgetel väärtustel (Aku...)',
          light: 'Hele',
          temperature: 'Temperatuur',
          humidity: 'Niiskus',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Väike',
          medium: 'Keskmine',
          large: 'Suur',
          xlarge: 'Väga suur'
        },
        bar_orientation: {
          ltr: 'Vasakult paremale',
          rtl: 'Paremalt vasakule',
          up: 'Üles'
        },
        bar_position: {
          default: 'Vaikimisi',
          below: 'Riba sisu all',
          top: 'Riba üleval',
          bottom: 'Riba all',
          overlay: 'Riba sisu kohal (overlay)',
          background: 'Kaardi taust'
        },
        layout: {
          horizontal: 'Horisontaalne (vaikimisi)',
          vertical: 'Vertikaalne'
        },
        bar_color_mode: {
          auto: 'Automaatne',
          segment: 'Segmendid',
          rainbow: 'Vikerkaar'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Ümarad nurgad',
          glass: 'Klaas',
          gradient: 'Gradient',
          gradient_reverse: 'Gradient pööratud',
          shimmer: 'Sära',
          shimmer_reverse: 'Sära pööratud'
        },
        hide: {
          icon: 'Ikoon',
          name: 'Nimi',
          value: 'Väärtus',
          unit: 'Ühik',
          secondary_info: 'Info',
          progress_bar: 'Riba'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  fi: {
    card: {
      msg: {
        appliedDefaultValue: 'Oletusarvo on asetettu automaattisesti.',
        attributeNotFound: 'Attribuuttia ei löytynyt Home Assistantista.',
        entityNotFound: 'Entiteettiä ei löytynyt Home Assistantista.',
        invalidActionObject: 'Toiminto-objekti on virheellinen tai huonosti rakennettu.',
        invalidDecimal: 'Arvon on oltava kelvollinen desimaaliluku.',
        invalidEntityId: 'Entiteetin tunniste on virheellinen tai väärin muotoiltu.',
        invalidEnumValue: 'Annettu arvo ei ole sallituista vaihtoehdoista.',
        invalidStateContent: 'Tilasisältö on virheellinen tai väärässä muodossa.',
        invalidStateContentEntry: 'Yksi tai useampi tilasisällön merkintä on virheellinen.',
        invalidTheme: 'Määritetty teema on tuntematon. Käytetään oletusteemaa.',
        invalidTypeArray: 'Odotettiin taulukkoarvoa.',
        invalidTypeBoolean: 'Odotettiin totuusarvoa (boolean).',
        invalidTypeNumber: 'Odotettiin numeerista arvoa.',
        invalidTypeObject: 'Odotettiin objektityyppistä arvoa.',
        invalidTypeString: 'Odotettiin merkkijonotyyppistä arvoa.',
        invalidUnionType: 'Arvo ei vastaa mitään sallituista tyypeistä.',
        missingActionKey: 'Toiminto-objektista puuttuu vaadittu avain.',
        missingRequiredProperty: 'Pakollinen ominaisuus puuttuu.'
      }
    },
    editor: {
      title: {
        content: 'Sisältö',
        interaction: 'Vuorovaikutukset',
        theme: 'Ulkoasu'
      },
      field: {
        attribute: 'Attribuutti',
        badge_color: 'Badge-väri',
        badge_icon: 'Badge-ikoni',
        bar_color: 'Pääväri',
        bar_effect_jinja: 'Palkin efekti (Jinja-tila)',
        bar_orientation: 'Palkin suunta',
        bar_position: 'Palkin sijainti',
        bar_single_line: 'Tiedot yhdellä rivillä',
        bar_size: 'Palkin koko',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Väritila',
        bar_scale: 'Bar scale',
        center_zero: 'Nolla keskellä',
        center_zero_value: 'Keskiarvo',
        center_zero_growth_percent: 'Kasvuprosentti',
        color: 'Pääväri',
        decimal: 'desimaali',
        double_tap_action: 'Toiminto kahdella napautuksella',
        entity: 'Entiteetti',
        force_circular_background: 'Pakota pyöreä tausta',
        hide_jinja: 'Piilota (Jinja-tila)',
        hold_action: 'Toiminto pitkällä painalluksella',
        icon: 'Ikoni',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Toiminto kahdella napautuksella kuvaketta',
        icon_hold_action: 'Toiminto pitkällä painalluksella kuvaketta',
        icon_tap_action: 'Toiminto kuvaketta napautettaessa',
        layout: 'Sisällön asettelu',
        max_value: 'Maksimiarvo',
        min_value: 'Minimiarvo',
        name: 'Nimi',
        percent: 'Prosentti',
        reverse_secondary_info_row: 'Vaihda palkki ja teksti',
        secondary: 'Lisätiedot',
        state_content: 'Tilan sisältö',
        show_all_actions: 'Näytä kaikki toiminnot',
        tap_action: 'Toiminto lyhyellä napautuksella',
        text_shadow: 'Lisää tekstivarjo',
        theme_mode: 'Theme mode',
        theme: 'Teema',
        custom_theme: 'Custom theme zones',
        unit: 'Yksikkö',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Mukautettu toissijainen tieto',
        multiline: 'Multiline',
        interpolate: 'Interpoloi värit',
        name_info: 'Mukautettu nimitieto',
        reverse: 'Käänteinen ajastin',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Lisäentiteetit',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimaalinen alhaisena (CPU, RAM...)',
          optimal_when_high: 'Optimaalinen korkeana (Akku...)',
          light: 'Valoisuus',
          temperature: 'Lämpötila',
          humidity: 'Kosteus',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Pieni',
          medium: 'Keski',
          large: 'Suuri',
          xlarge: 'Erittäin suuri'
        },
        bar_orientation: {
          ltr: 'Vasemmalta oikealle',
          rtl: 'Oikealta vasemmalle',
          up: 'Ylös'
        },
        bar_position: {
          default: 'Oletus',
          below: 'Palkki sisällön alla',
          top: 'Palkki ylhäällä',
          bottom: 'Palkki alhaalla',
          overlay: 'Palkki sisällön päällä (overlay)',
          background: 'Kortin tausta'
        },
        layout: {
          horizontal: 'Vaakasuora (oletus)',
          vertical: 'Pystysuora'
        },
        bar_color_mode: {
          auto: 'Automaattinen',
          segment: 'Segmentit',
          rainbow: 'Sateenkaari'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Pyöristetyt kulmat',
          glass: 'Lasi',
          gradient: 'Liukuväri',
          gradient_reverse: 'Liukuväri käänteinen',
          shimmer: 'Hohto',
          shimmer_reverse: 'Hohto käänteinen'
        },
        hide: {
          icon: 'Kuvake',
          name: 'Nimi',
          value: 'Arvo',
          unit: 'Yksikkö',
          secondary_info: 'Tiedot',
          progress_bar: 'Palkki'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  fr: {
    card: {
      msg: {
        appliedDefaultValue: 'Une valeur par défaut a été appliquée automatiquement.',
        attributeNotFound: 'Attribut introuvable dans Home Assistant.',
        entityNotFound: 'Entité introuvable dans Home Assistant.',
        invalidActionObject: 'L’objet action est invalide ou mal structuré.',
        invalidDecimal: 'La valeur doit être un nombre entier positif.',
        invalidEntityId: 'L’identifiant de l’entité est invalide ou mal formé.',
        invalidEnumValue: 'La valeur fournie ne fait pas partie des options autorisées.',
        invalidStateContent: 'Le contenu d’état est invalide ou mal formé.',
        invalidStateContentEntry: 'Une ou plusieurs entrées du contenu d’état sont invalides.',
        invalidTheme: 'Le thème spécifié est inconnu. Le thème par défaut sera utilisé.',
        invalidTypeArray: 'Une valeur de type tableau était attendue.',
        invalidTypeBoolean: 'Une valeur de type booléen était attendue.',
        invalidTypeNumber: 'Une valeur de type nombre était attendue.',
        invalidTypeObject: 'Une valeur de type objet était attendue.',
        invalidTypeString: 'Une valeur de type chaîne de caractères était attendue.',
        invalidUnionType: 'La valeur ne correspond à aucun des types autorisés.',
        missingActionKey: 'Une clé requise est manquante dans l’objet action.',
        missingRequiredProperty: 'Une propriété requise est manquante.'
      }
    },
    editor: {
      title: {
        content: 'Contenu',
        interaction: 'Interactions',
        theme: 'Aspect visuel et convivialité'
      },
      field: {
        attribute: 'Attribut',
        badge_color: 'Couleur du badge',
        badge_icon: 'Icône du badge',
        bar_color: 'Couleur de la barre',
        bar_effect_jinja: 'Effet sur la barre (mode Jinja)',
        bar_orientation: 'Orientation de la barre',
        bar_position: 'Position de la barre',
        bar_single_line: 'Infos sur une ligne',
        bar_size: 'Taille de la barre',
        bar_segments: 'Segments de barre',
        bar_color_mode: 'Mode de couleur de la barre',
        bar_scale: 'Échelle de la barre',
        center_zero: 'Zéro au centre',
        center_zero_value: 'Valeur de centrage',
        center_zero_growth_percent: 'Pourcentage de croissance',
        color: 'Couleur de l\'icône',
        decimal: 'décimal',
        double_tap_action: 'Comportement lors d\'un double appui',
        entity: 'Entité',
        force_circular_background: 'Forcer le fond circulaire',
        hide_jinja: 'Masquer (mode Jinja)',
        hold_action: 'Comportement lors d\'un appui long',
        icon: 'Icône',
        icon_animation: 'Animation de l\'icône',
        icon_double_tap_action: 'Comportement lors d\'un double appui sur l\'icône',
        icon_hold_action: 'Comportement lors d\'un appui long sur l\'icône',
        icon_tap_action: 'Comportement lors de l\'appui sur l\'icône',
        layout: 'Disposition du contenu',
        max_value: 'Valeur maximum',
        min_value: 'Valeur minimum',
        name: 'Nom',
        percent: 'Pourcentage',
        reverse_secondary_info_row: 'Intervertir barre et texte',
        secondary: 'Information secondaire',
        state_content: 'Contenu de l’état',
        show_all_actions: 'Afficher toutes les interactions',
        tap_action: 'Comportement lors d\'un appui court',
        text_shadow: 'Ajouter une ombre au texte',
        theme_mode: 'Mode de thème',
        theme: 'Thème',
        custom_theme: 'Zones de thème personnalisé',
        unit: 'Unité',
        min_value_mode: 'Source de la valeur min',
        max_value_mode: 'Source de la valeur max',
        watermark_low_mode: 'Source du seuil bas',
        watermark_high_mode: 'Source du seuil haut',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alerte',
        custom_info: 'Info secondaire personnalisée',
        multiline: 'Multiligne',
        interpolate: 'Interpoler les couleurs',
        name_info: 'Info nom personnalisée',
        reverse: 'Inverser le minuteur',
        bar_stack_mode: 'Mode d\'empilement',
        bar_stack: 'Entités supplémentaires',
        migrate_config: 'Migrer la config'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimal quand c\'est bas (CPU, RAM,...)',
          optimal_when_high: 'Optimal quand c\'est élevé (Batterie...)',
          light: 'Lumière',
          temperature: 'Température',
          humidity: 'Humidité',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Petite',
          medium: 'Moyenne',
          large: 'Grande',
          xlarge: 'Très grande'
        },
        bar_orientation: {
          ltr: 'Gauche à droite',
          rtl: 'Droite à gauche',
          up: 'Vers le haut'
        },
        bar_position: {
          default: 'Défaut',
          below: 'Barre en dessous du contenu',
          top: 'Barre en haut',
          bottom: 'Barre en bas',
          overlay: 'Barre superposée au contenu (overlay)',
          background: 'Arrière-plan de la carte'
        },
        layout: {
          horizontal: 'Horizontal (par défaut)',
          vertical: 'Vertical'
        },
        bar_color_mode: {
          auto: 'Auto',
          segment: 'Segmenté',
          rainbow: 'Arc-en-ciel'
        },
        bar_scale: {
          linear: 'Linéaire',
          log: 'Logarithmique'
        },
        bar_effect: {
          radius: 'Coins arrondis',
          glass: 'Verre',
          gradient: 'Dégradé',
          gradient_reverse: 'Dégradé inversé',
          shimmer: 'Reflet',
          shimmer_reverse: 'Reflet inversé'
        },
        hide: {
          icon: 'Icône',
          name: 'Nom',
          value: 'Valeur',
          unit: 'Unité',
          secondary_info: 'Info',
          progress_bar: 'Barre'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Seuil bas',
          high: 'Seuil haut',
          type: 'Type',
          opacity: 'Opacité',
          low_color: 'Couleur du seuil bas',
          high_color: 'Couleur du seuil haut',
          low_as: 'Unité (seuil bas)',
          high_as: 'Unité (seuil haut)',
          line_size: 'Épaisseur de ligne',
          disable_low: 'Désactiver le seuil bas',
          disable_high: 'Désactiver le seuil haut',
          low_attribute: 'Attribut',
          high_attribute: 'Attribut'
        },
        icon_animation: {
          none: 'Aucune',
          spin: 'Rotation',
          pulse: 'Pulsation',
          bounce: 'Rebond',
          shake: 'Secousse',
          ping: 'Ping',
          reveal: 'Apparition',
          washing_machine: 'Machine à laver',
          battery_charging: 'Batterie en charge'
        },
        alert_when: {
          above: 'Alerte au-dessus de',
          below: 'Alerte en dessous de',
          color: 'Couleur d\'alerte',
          highlight: 'Mise en évidence',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Bordure',
          background: 'Fond'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Valeur fixe',
          entity: 'Entité',
          jinja: 'Modèle'
        },
        max_value_mode: {
          standard: 'Valeur fixe',
          entity: 'Entité',
          jinja: 'Modèle'
        },
        watermark_low_mode: {
          standard: 'Valeur fixe',
          entity: 'Entité',
          jinja: 'Modèle'
        },
        watermark_high_mode: {
          standard: 'Valeur fixe',
          entity: 'Entité',
          jinja: 'Modèle'
        },
        theme_mode: {
          preset: 'Prédéfini',
          custom: 'Personnalisé'
        },
        min_value: {
          attribute: 'Attribut'
        },
        max_value: {
          attribute: 'Attribut'
        },
        bar_stack_mode: {
          stacked: 'Empilé',
          proportional: 'Proportionnel',
          net: 'Net'
        }
      }
    }
  },
  hi: {
    card: {
      msg: {
        appliedDefaultValue: 'एक डिफ़ॉल्ट मान स्वचालित रूप से लागू किया गया है।',
        attributeNotFound: 'HA में एट्रिब्यूट नहीं मिला।',
        entityNotFound: 'HA में एंटिटी नहीं मिली।',
        invalidActionObject: 'एक्शन ऑब्जेक्ट अमान्य या गलत तरीके से संरचित है।',
        invalidDecimal: 'मान एक वैध दशमलव संख्या होना चाहिए।',
        invalidEntityId: 'एंटिटी आईडी अमान्य या गलत तरीके से बनाई गई है।',
        invalidEnumValue: 'प्रदान किया गया मान अनुमतित विकल्पों में से एक नहीं है।',
        invalidStateContent: 'स्थिति सामग्री अमान्य या गलत तरीके से बनाई गई है।',
        invalidStateContentEntry: 'स्थिति सामग्री में एक या अधिक प्रविष्टियां अमान्य हैं।',
        invalidTheme: 'निर्दिष्ट थीम अज्ञात है। डिफ़ॉल्ट थीम का उपयोग किया जाएगा।',
        invalidTypeArray: 'एरे प्रकार का मान अपेक्षित है।',
        invalidTypeBoolean: 'बूलियन प्रकार का मान अपेक्षित है।',
        invalidTypeNumber: 'संख्या प्रकार का मान अपेक्षित है।',
        invalidTypeObject: 'ऑब्जेक्ट प्रकार का मान अपेक्षित है।',
        invalidTypeString: 'स्ट्रिंग प्रकार का मान अपेक्षित है।',
        invalidUnionType: 'मान अनुमतित प्रकारों में से किसी से मेल नहीं खाता।',
        missingActionKey: 'एक्शन ऑब्जेक्ट में एक आवश्यक कुंजी गायब है।',
        missingRequiredProperty: 'आवश्यक गुण गायब है।'
      }
    },
    editor: {
      title: {
        content: 'सामग्री',
        interaction: 'बातचीत',
        theme: 'रूप और अनुभव'
      },
      field: {
        attribute: 'एट्रिब्यूट',
        badge_color: 'बैज का रंग',
        badge_icon: 'बैज का आइकन',
        bar_color: 'मुख्य रंग',
        bar_effect_jinja: 'बार पर प्रभाव (Jinja मोड)',
        bar_orientation: 'बार की दिशा',
        bar_position: 'बार की स्थिति',
        bar_single_line: 'एक पंक्ति में जानकारी',
        bar_size: 'बार का आकार',
        bar_segments: 'Bar segments',
        bar_color_mode: 'रंग मोड',
        bar_scale: 'Bar scale',
        center_zero: 'शून्य केंद्र में',
        center_zero_value: 'केंद्र मान',
        center_zero_growth_percent: 'वृद्धि प्रतिशत',
        color: 'मुख्य रंग',
        decimal: 'दशमलव',
        double_tap_action: 'डबल टैप व्यवहार',
        entity: 'एंटिटी',
        force_circular_background: 'गोलाकार पृष्ठभूमि को बाध्य करें',
        hide_jinja: 'छिपाएँ (Jinja मोड)',
        hold_action: 'होल्ड व्यवहार',
        icon: 'आइकन',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'आइकन डबल टैप व्यवहार',
        icon_hold_action: 'आइकन होल्ड व्यवहार',
        icon_tap_action: 'आइकन टैप व्यवहार',
        layout: 'सामग्री लेआउट',
        max_value: 'अधिकतम मान',
        min_value: 'न्यूनतम मान',
        name: 'नाम',
        percent: 'प्रतिशत',
        reverse_secondary_info_row: 'बार और टेक्स्ट बदलें',
        secondary: 'सहायक जानकारी',
        state_content: 'स्थिति की सामग्री',
        show_all_actions: 'सभी क्रियाएँ दिखाएँ',
        tap_action: 'टैप व्यवहार',
        text_shadow: 'टेक्स्ट में छाया जोड़ें',
        theme_mode: 'Theme mode',
        theme: 'थीम',
        custom_theme: 'Custom theme zones',
        unit: 'इकाई',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'कस्टम द्वितीयक जानकारी',
        multiline: 'Multiline',
        interpolate: 'रंग इंटरपोलेशन',
        name_info: 'कस्टम नाम जानकारी',
        reverse: 'टाइमर उलटें',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'अतिरिक्त एंटिटी',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'बाएं से दाएं',
          rtl: 'दाएं से बाएं',
          up: 'ऊपर की ओर'
        },
        bar_position: {
          below: 'सामग्री के नीचे बार',
          bottom: 'नीचे बार',
          default: 'डिफ़ॉल्ट',
          overlay: 'सामग्री पर ओवरले बार',
          top: 'ऊपर बार',
          background: 'कार्ड पृष्ठभूमि'
        },
        bar_size: {
          large: 'बड़ी',
          medium: 'मध्यम',
          small: 'छोटी',
          xlarge: 'अतिरिक्त बड़ी'
        },
        layout: {
          horizontal: 'क्षैतिज (डिफ़ॉल्ट)',
          vertical: 'लंबवत'
        },
        theme: {
          humidity: 'आर्द्रता',
          light: 'प्रकाश',
          optimal_when_high: 'उच्च होने पर इष्टतम (बैटरी...)',
          optimal_when_low: 'कम होने पर इष्टतम (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'तापमान',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'स्वचालित',
          segment: 'खंड',
          rainbow: 'इंद्रधनुष'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'गोल कोने',
          glass: 'कांच',
          gradient: 'ग्रेडिएंट',
          gradient_reverse: 'उल्टा ग्रेडिएंट',
          shimmer: 'चमक',
          shimmer_reverse: 'उल्टी चमक'
        },
        hide: {
          icon: 'आइकन',
          name: 'नाम',
          value: 'मूल्य',
          unit: 'इकाई',
          secondary_info: 'जानकारी',
          progress_bar: 'बार'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  hr: {
    card: {
      msg: {
        appliedDefaultValue: 'Zadana vrijednost automatski je primijenjena.',
        attributeNotFound: 'Atribut nije pronađen u Home Assistantu.',
        entityNotFound: 'Entitet nije pronađen u Home Assistantu.',
        invalidActionObject: 'Objekt radnje je nevažeći ili loše strukturiran.',
        invalidDecimal: 'Vrijednost mora biti valjani decimalni broj.',
        invalidEntityId: 'ID entiteta je nevažeći ili pogrešno formatiran.',
        invalidEnumValue: 'Navedena vrijednost nije među dopuštenim opcijama.',
        invalidStateContent: 'Sadržaj stanja je nevažeći ili pogrešno formatiran.',
        invalidStateContentEntry: 'Jedan ili više unosa stanja su nevažeći.',
        invalidTheme: 'Navedena tema je nepoznata. Koristi se zadana tema.',
        invalidTypeArray: 'Očekivana je vrijednost tipa polje.',
        invalidTypeBoolean: 'Očekivana je vrijednost tipa boolean.',
        invalidTypeNumber: 'Očekivana je vrijednost tipa broj.',
        invalidTypeObject: 'Očekivana je vrijednost tipa objekt.',
        invalidTypeString: 'Očekivana je vrijednost tipa string.',
        invalidUnionType: 'Vrijednost ne odgovara nijednom dopuštenom tipu.',
        missingActionKey: 'Nedostaje obavezni ključ u objektu radnje.',
        missingRequiredProperty: 'Nedostaje obavezno svojstvo.'
      }
    },
    editor: {
      title: {
        content: 'Sadržaj',
        interaction: 'Interakcije',
        theme: 'Izgled i funkcionalnost'
      },
      field: {
        attribute: 'Atribut',
        badge_color: 'Boja oznake',
        badge_icon: 'Ikona oznake',
        bar_color: 'Boja za traku',
        bar_effect_jinja: 'Efekt na traci (Jinja način)',
        bar_orientation: 'Orijentacija trake',
        bar_position: 'Položaj trake',
        bar_single_line: 'Informacije u jednom retku',
        bar_size: 'Veličina trake',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Način boje',
        bar_scale: 'Bar scale',
        center_zero: 'Nula u sredini',
        center_zero_value: 'Vrijednost sredine',
        center_zero_growth_percent: 'Postotak rasta',
        color: 'Primarna boja',
        decimal: 'decimalni',
        double_tap_action: 'Radnja na dupli dodir',
        entity: 'Entitet',
        force_circular_background: 'Prisili kružnu pozadinu',
        hide_jinja: 'Sakrij (Jinja način)',
        hold_action: 'Radnja na dugi dodir',
        icon: 'Ikona',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Radnja na dupli dodir ikone',
        icon_hold_action: 'Radnja na dugi dodir ikone',
        icon_tap_action: 'Radnja na dodir ikone',
        layout: 'Raspored sadržaja',
        max_value: 'Maksimalna vrijednost',
        min_value: 'Minimalna vrijednost',
        name: 'Ime',
        percent: 'Postotak',
        reverse_secondary_info_row: 'Zamijeni traku i tekst',
        secondary: 'Sekundarne informacije',
        state_content: 'Sadržaj stanja',
        show_all_actions: 'Prikaži sve radnje',
        tap_action: 'Radnja na kratki dodir',
        text_shadow: 'Dodaj sjenu tekstu',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Custom theme zones',
        unit: 'Jedinica',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Prilagođena sekundarna informacija',
        multiline: 'Multiline',
        interpolate: 'Interpolacija boja',
        name_info: 'Prilagođena informacija naziva',
        reverse: 'Obrnuti tajmer',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Dodatni entiteti',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'Lijevo na desno',
          rtl: 'Desno na lijevo',
          up: 'Prema gore'
        },
        bar_position: {
          below: 'Traka ispod sadržaja',
          bottom: 'Traka na dnu',
          default: 'Zadano',
          overlay: 'Traka preklopljena na sadržaj (overlay)',
          top: 'Traka na vrhu',
          background: 'Pozadina kartice'
        },
        bar_size: {
          large: 'Velika',
          medium: 'Srednja',
          small: 'Mala',
          xlarge: 'Vrlo velika'
        },
        layout: {
          horizontal: 'Horizontalno (zadano)',
          vertical: 'Vertikalno'
        },
        theme: {
          humidity: 'Vlažnost',
          light: 'Svjetlo',
          optimal_when_high: 'Optimalno kada je visoko (Baterija...)',
          optimal_when_low: 'Optimalno kada je nisko (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'Temperatura',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Automatski',
          segment: 'Segmenti',
          rainbow: 'Duga'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Zaobljeni uglovi',
          glass: 'Staklo',
          gradient: 'Prijelaz',
          gradient_reverse: 'Obrnuti prijelaz',
          shimmer: 'Sjaj',
          shimmer_reverse: 'Obrnuti sjaj'
        },
        hide: {
          icon: 'Ikona',
          name: 'Ime',
          value: 'Vrijednost',
          unit: 'Jedinica',
          secondary_info: 'Info',
          progress_bar: 'Traka'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  hu: {
    card: {
      msg: {
        appliedDefaultValue: 'Alapértelmezett érték automatikusan alkalmazva.',
        attributeNotFound: 'Az attribútum nem található a Home Assistantban.',
        entityNotFound: 'Az entitás nem található a Home Assistantban.',
        invalidActionObject: 'Az action objektum érvénytelen vagy hibás felépítésű.',
        invalidDecimal: 'Az értéknek pozitív egész számnak kell lennie.',
        invalidEntityId: 'Az entitás azonosító érvénytelen vagy hibás.',
        invalidEnumValue: 'A megadott érték nem része az engedélyezett opcióknak.',
        invalidStateContent: 'Az állapot tartalma érvénytelen vagy hibás.',
        invalidStateContentEntry: 'Az állapot tartalmának egy vagy több eleme érvénytelen.',
        invalidTheme: 'Az adott téma ismeretlen. Az alapértelmezett téma lesz használva.',
        invalidTypeArray: 'Tömb típusú érték volt elvárva.',
        invalidTypeBoolean: 'Logikai (boolean) érték volt elvárva.',
        invalidTypeNumber: 'Szám típusú érték volt elvárva.',
        invalidTypeObject: 'Objektum típusú érték volt elvárva.',
        invalidTypeString: 'Szöveg típusú érték volt elvárva.',
        invalidUnionType: 'Az érték nem felel meg egyik engedélyezett típusnak sem.',
        missingActionKey: 'Egy kötelező kulcs hiányzik az action objektumból.',
        missingRequiredProperty: 'Egy kötelező tulajdonság hiányzik.'
      }
    },
    editor: {
      title: {
        content: 'Tartalom',
        interaction: 'Interakciók',
        theme: 'Megjelenés és használhatóság'
      },
      field: {
        attribute: 'Attribútum',
        badge_color: 'Jelvény színe',
        badge_icon: 'Jelvény ikon',
        bar_color: 'Sáv színe',
        bar_effect_jinja: 'Sáv effektus (Jinja mód)',
        bar_orientation: 'Sáv iránya',
        bar_position: 'Sáv pozíciója',
        bar_single_line: 'Egy soros információ',
        bar_size: 'Sáv mérete',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Szín mód',
        bar_scale: 'Bar scale',
        center_zero: 'Nulla középen',
        center_zero_value: 'Középérték',
        center_zero_growth_percent: 'Növekedési százalék',
        color: 'Ikon színe',
        decimal: 'Tizedes',
        double_tap_action: 'Kettős koppintás művelet',
        entity: 'Entitás',
        force_circular_background: 'Kör alakú háttér erőltetése',
        hide_jinja: 'Elrejtés (Jinja mód)',
        hold_action: 'Hosszan tartó nyomás művelet',
        icon: 'Ikon',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Ikon dupla koppintás művelet',
        icon_hold_action: 'Ikon hosszan nyomás művelet',
        icon_tap_action: 'Ikon koppintás művelet',
        layout: 'Tartalom elrendezése',
        max_value: 'Maximális érték',
        min_value: 'Minimális érték',
        name: 'Név',
        percent: 'Százalék',
        reverse_secondary_info_row: 'Cserélje fel a sávot és a szöveget',
        secondary: 'Másodlagos információ',
        state_content: 'Állapot tartalma',
        show_all_actions: 'Az összes művelet megjelenítése',
        tap_action: 'Koppintás művelet',
        text_shadow: 'Szöveg árnyék hozzáadása',
        theme_mode: 'Theme mode',
        theme: 'Téma',
        custom_theme: 'Custom theme zones',
        unit: 'Mértékegység',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Egyéni másodlagos info',
        multiline: 'Multiline',
        interpolate: 'Színinterpoláció',
        name_info: 'Egyéni névinfo',
        reverse: 'Fordított időzítő',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'További entitások',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimális alacsony értéknél (CPU, RAM...)',
          optimal_when_high: 'Optimális magas értéknél (Akkumulátor...)',
          light: 'Világos',
          temperature: 'Hőmérséklet',
          humidity: 'Páratartalom',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Kicsi',
          medium: 'Közepes',
          large: 'Nagy',
          xlarge: 'Nagyon nagy'
        },
        bar_orientation: {
          ltr: 'Balról jobbra',
          rtl: 'Jobbról balra',
          up: 'Felfelé'
        },
        bar_position: {
          default: 'Alapértelmezett',
          below: 'Sáv a tartalom alatt',
          top: 'Sáv fent',
          bottom: 'Sáv lent',
          overlay: 'Sáv a tartalmon (overlay)',
          background: 'Kártya háttér'
        },
        layout: {
          horizontal: 'Vízszintes (alapértelmezett)',
          vertical: 'Függőleges'
        },
        bar_color_mode: {
          auto: 'Automatikus',
          segment: 'Szegmens',
          rainbow: 'Szivárvány'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Lekerekített sarkok',
          glass: 'Üveg',
          gradient: 'Átmenet',
          gradient_reverse: 'Fordított átmenet',
          shimmer: 'Csillogás',
          shimmer_reverse: 'Fordított csillogás'
        },
        hide: {
          icon: 'Ikon',
          name: 'Név',
          value: 'Érték',
          unit: 'Egység',
          secondary_info: 'Info',
          progress_bar: 'Sáv'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  id: {
    card: {
      msg: {
        appliedDefaultValue: 'Nilai default telah diterapkan secara otomatis.',
        attributeNotFound: 'Atribut tidak ditemukan di HA.',
        entityNotFound: 'Entitas tidak ditemukan di HA.',
        invalidActionObject: 'Objek aksi tidak valid atau struktur salah.',
        invalidDecimal: 'Nilai harus berupa angka desimal yang valid.',
        invalidEntityId: 'ID entitas tidak valid atau salah format.',
        invalidEnumValue: 'Nilai yang diberikan bukan salah satu dari opsi yang diizinkan.',
        invalidStateContent: 'Konten state tidak valid atau salah format.',
        invalidStateContentEntry: 'Satu atau lebih entri dalam konten state tidak valid.',
        invalidTheme: 'Tema yang ditentukan tidak dikenal. Tema default akan digunakan.',
        invalidTypeArray: 'Mengharapkan nilai bertipe array.',
        invalidTypeBoolean: 'Mengharapkan nilai bertipe boolean.',
        invalidTypeNumber: 'Mengharapkan nilai bertipe angka.',
        invalidTypeObject: 'Mengharapkan nilai bertipe object.',
        invalidTypeString: 'Mengharapkan nilai bertipe string.',
        invalidUnionType: 'Nilai tidak cocok dengan tipe yang diizinkan.',
        missingActionKey: 'Kunci yang diperlukan hilang dalam objek aksi.',
        missingRequiredProperty: 'Properti yang diperlukan hilang.'
      }
    },
    editor: {
      title: {
        content: 'Konten',
        interaction: 'Interaksi',
        theme: 'Tampilan & Nuansa'
      },
      field: {
        attribute: 'Atribut',
        badge_color: 'Warna lencana',
        badge_icon: 'Ikon lencana',
        bar_color: 'Warna bar',
        bar_effect_jinja: 'Efek pada bar (mode Jinja)',
        bar_orientation: 'Orientasi bar',
        bar_position: 'Posisi bar',
        bar_single_line: 'Info dalam satu baris',
        bar_size: 'Ukuran bar',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Mode warna',
        bar_scale: 'Bar scale',
        center_zero: 'Nol di tengah',
        center_zero_value: 'Nilai tengah',
        center_zero_growth_percent: 'Persentase pertumbuhan',
        color: 'Warna utama',
        decimal: 'desimal',
        double_tap_action: 'Perilaku ketuk ganda',
        entity: 'Entitas',
        force_circular_background: 'Paksa latar belakang melingkar',
        hide_jinja: 'Sembunyikan (mode Jinja)',
        hold_action: 'Perilaku tahan',
        icon: 'Ikon',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Perilaku ketuk ganda ikon',
        icon_hold_action: 'Perilaku tahan ikon',
        icon_tap_action: 'Perilaku ketuk ikon',
        layout: 'Tata letak konten',
        max_value: 'Nilai maksimum',
        min_value: 'Nilai minimum',
        name: 'Nama',
        percent: 'Persentase',
        reverse_secondary_info_row: 'Tukar bilah dan teks',
        secondary: 'Informasi sekunder',
        state_content: 'Konten status',
        show_all_actions: 'Tampilkan semua tindakan',
        tap_action: 'Perilaku ketuk',
        text_shadow: 'Tambahkan bayangan teks',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Custom theme zones',
        unit: 'Unit',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Info sekunder kustom',
        multiline: 'Multiline',
        interpolate: 'Interpolasi warna',
        name_info: 'Info nama kustom',
        reverse: 'Timer terbalik',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Entitas tambahan',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'Kiri ke kanan',
          rtl: 'Kanan ke kiri',
          up: 'Ke atas'
        },
        bar_position: {
          below: 'Bar di bawah konten',
          bottom: 'Bar di bawah',
          default: 'Default',
          overlay: 'Bar ditumpangkan pada konten (overlay)',
          top: 'Bar di atas',
          background: 'Latar belakang kartu'
        },
        bar_size: {
          large: 'Besar',
          medium: 'Sedang',
          small: 'Kecil',
          xlarge: 'Sangat besar'
        },
        layout: {
          horizontal: 'Horizontal (default)',
          vertical: 'Vertikal'
        },
        theme: {
          humidity: 'Kelembaban',
          light: 'Cahaya',
          optimal_when_high: 'Optimal saat Tinggi (Baterai...)',
          optimal_when_low: 'Optimal saat Rendah (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'Suhu',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Otomatis',
          segment: 'Segmen',
          rainbow: 'Pelangi'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Sudut membulat',
          glass: 'Kaca',
          gradient: 'Gradien',
          gradient_reverse: 'Gradien terbalik',
          shimmer: 'Kilau',
          shimmer_reverse: 'Kilau terbalik'
        },
        hide: {
          icon: 'Ikon',
          name: 'Nama',
          value: 'Nilai',
          unit: 'Unit',
          secondary_info: 'Info',
          progress_bar: 'Bilah'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  it: {
    card: {
      msg: {
        appliedDefaultValue: 'È stato applicato automaticamente un valore predefinito.',
        attributeNotFound: 'Attributo non trovato in Home Assistant.',
        entityNotFound: 'Entità non trovata in Home Assistant.',
        invalidActionObject: 'L\'oggetto azione non è valido o è strutturato in modo errato.',
        invalidDecimal: 'Il valore deve essere un numero decimale valido.',
        invalidEntityId: 'L\'ID dell\'entità non è valido o è mal formattato.',
        invalidEnumValue: 'Il valore fornito non è tra quelli consentiti.',
        invalidStateContent: 'Il contenuto dello stato non è valido o è mal formattato.',
        invalidStateContentEntry: 'Una o più voci nel contenuto dello stato non sono valide.',
        invalidTheme: 'Il tema specificato è sconosciuto. Verrà utilizzato il tema predefinito.',
        invalidTypeArray: 'Atteso un valore di tipo array.',
        invalidTypeBoolean: 'Atteso un valore di tipo booleano.',
        invalidTypeNumber: 'Atteso un valore di tipo numero.',
        invalidTypeObject: 'Atteso un valore di tipo oggetto.',
        invalidTypeString: 'Atteso un valore di tipo stringa.',
        invalidUnionType: 'Il valore non corrisponde a nessuno dei tipi consentiti.',
        missingActionKey: 'Manca una chiave obbligatoria nell\'oggetto azione.',
        missingRequiredProperty: 'Proprietà obbligatoria mancante.'
      }
    },
    editor: {
      title: {
        content: 'Contenuto',
        interaction: 'Interazioni',
        theme: 'Aspetto e funzionalità'
      },
      field: {
        attribute: 'Attributo',
        badge_color: 'Colore del badge',
        badge_icon: 'Icona del badge',
        bar_color: 'Colore della barra',
        bar_effect_jinja: 'Effetto sulla barra (modalità Jinja)',
        bar_orientation: 'Orientamento della barra',
        bar_position: 'Posizione della barra',
        bar_single_line: 'Info su una riga',
        bar_size: 'Dimensione della barra',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Modalità colore barra',
        bar_scale: 'Scala della barra',
        center_zero: 'Zero al centro',
        center_zero_value: 'Valore centrale',
        center_zero_growth_percent: 'Percentuale di crescita',
        color: 'Colore dell\'icona',
        decimal: 'Decimale',
        double_tap_action: 'Azione al doppio tocco',
        entity: 'Entità',
        force_circular_background: 'Forza sfondo circolare',
        hide_jinja: 'Nascondi (modalità Jinja)',
        hold_action: 'Azione al tocco prolungato',
        icon: 'Icona',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Azione al doppio tocco dell\'icona',
        icon_hold_action: 'Azione al tocco prolungato dell\'icona',
        icon_tap_action: 'Azione al tocco dell\'icona',
        layout: 'Layout del contenuto',
        max_value: 'Valore massimo',
        min_value: 'Valore minimo',
        name: 'Nome',
        percent: 'Percentuale',
        reverse_secondary_info_row: 'Scambia barra e testo',
        secondary: 'Informazione secondaria',
        state_content: 'Contenuto dello stato',
        show_all_actions: 'Mostra tutte le azioni',
        tap_action: 'Azione al tocco breve',
        text_shadow: 'Aggiungi ombra al testo',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Zone tema personalizzato',
        unit: 'Unità',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Info secondaria personalizzata',
        multiline: 'Multilinea',
        interpolate: 'Interpolazione colori',
        name_info: 'Info nome personalizzata',
        reverse: 'Timer inverso',
        bar_stack_mode: 'Modalità di impilamento',
        bar_stack: 'Entità aggiuntive',
        migrate_config: 'Migra configurazione'
      },
      option: {
        bar_orientation: {
          ltr: 'Da sinistra a destra',
          rtl: 'Da destra a sinistra',
          up: 'Verso l\'alto'
        },
        bar_position: {
          below: 'Barra sotto il contenuto',
          bottom: 'Barra in basso',
          default: 'Predefinito',
          overlay: 'Barra sovrapposta al contenuto (overlay)',
          top: 'Barra in alto',
          background: 'Sfondo della scheda'
        },
        bar_size: {
          large: 'Grande',
          medium: 'Media',
          small: 'Piccola',
          xlarge: 'Extra grande'
        },
        layout: {
          horizontal: 'Orizzontale (predefinito)',
          vertical: 'Verticale'
        },
        theme: {
          humidity: 'Umidità',
          light: 'Luce',
          optimal_when_high: 'Ottimale quando è alto (Batteria...)',
          optimal_when_low: 'Ottimale quando è basso (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'Temperatura',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Automatico',
          segment: 'Segmenti',
          rainbow: 'Arcobaleno'
        },
        bar_scale: {
          linear: 'Lineare',
          log: 'Logaritmica'
        },
        bar_effect: {
          radius: 'Angoli arrotondati',
          glass: 'Vetro',
          gradient: 'Sfumatura',
          gradient_reverse: 'Sfumatura inversa',
          shimmer: 'Riflesso',
          shimmer_reverse: 'Riflesso inverso'
        },
        hide: {
          icon: 'Icona',
          name: 'Nome',
          value: 'Valore',
          unit: 'Unità',
          secondary_info: 'Info',
          progress_bar: 'Barra'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Soglia bassa',
          high: 'Soglia alta',
          type: 'Tipo',
          opacity: 'Opacità',
          low_color: 'Colore soglia bassa',
          high_color: 'Colore soglia alta',
          low_as: 'Unità (soglia bassa)',
          high_as: 'Unità (soglia alta)',
          line_size: 'Spessore linea',
          disable_low: 'Disattiva soglia bassa',
          disable_high: 'Disattiva soglia alta',
          low_attribute: 'Attributo',
          high_attribute: 'Attributo'
        },
        icon_animation: {
          none: 'Nessuna',
          spin: 'Rotazione',
          pulse: 'Pulsazione',
          bounce: 'Rimbalzo',
          shake: 'Vibrazione',
          ping: 'Ping',
          reveal: 'Comparsa',
          washing_machine: 'Lavatrice',
          battery_charging: 'Batteria in carica'
        },
        alert_when: {
          above: 'Allerta sopra',
          below: 'Allerta sotto',
          color: 'Colore allerta',
          highlight: 'Evidenziazione',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Bordo',
          background: 'Sfondo'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Valore fisso',
          entity: 'Entità',
          jinja: 'Modello'
        },
        max_value_mode: {
          standard: 'Valore fisso',
          entity: 'Entità',
          jinja: 'Modello'
        },
        watermark_low_mode: {
          standard: 'Valore fisso',
          entity: 'Entità',
          jinja: 'Modello'
        },
        watermark_high_mode: {
          standard: 'Valore fisso',
          entity: 'Entità',
          jinja: 'Modello'
        },
        theme_mode: {
          preset: 'Predefinito',
          custom: 'Personalizzato'
        },
        min_value: {
          attribute: 'Attributo'
        },
        max_value: {
          attribute: 'Attributo'
        },
        bar_stack_mode: {
          stacked: 'Impilato',
          proportional: 'Proporzionale',
          net: 'Netto'
        }
      }
    }
  },
  ja: {
    card: {
      msg: {
        appliedDefaultValue: 'デフォルト値が自動的に適用されました。',
        attributeNotFound: 'Home Assistant に属性が見つかりません。',
        entityNotFound: 'Home Assistant にエンティティが見つかりません。',
        invalidActionObject: 'アクションオブジェクトが無効または構造が不正です。',
        invalidDecimal: '値は有効な小数である必要があります。',
        invalidEntityId: 'エンティティ ID が無効か、形式が正しくありません。',
        invalidEnumValue: '指定された値は許可されたオプションのいずれでもありません。',
        invalidStateContent: '状態の内容が無効または形式が不正です。',
        invalidStateContentEntry: '状態の内容の1つ以上のエントリが無効です。',
        invalidTheme: '指定されたテーマは不明です。デフォルトのテーマが使用されます。',
        invalidTypeArray: '配列型の値が必要です。',
        invalidTypeBoolean: 'ブール型の値が必要です。',
        invalidTypeNumber: '数値型の値が必要です。',
        invalidTypeObject: 'オブジェクト型の値が必要です。',
        invalidTypeString: '文字列型の値が必要です。',
        invalidUnionType: '値が許可された型のいずれにも一致しません。',
        missingActionKey: 'アクションオブジェクトに必要なキーが欠落しています。',
        missingRequiredProperty: '必要なプロパティが欠落しています。'
      }
    },
    editor: {
      title: {
        content: 'コンテンツ',
        interaction: 'インタラクション',
        theme: '外観'
      },
      field: {
        attribute: '属性',
        badge_color: 'バッジの色',
        badge_icon: 'バッジのアイコン',
        bar_color: 'バーの色',
        bar_effect_jinja: 'バーのエフェクト (Jinjaモード)',
        bar_orientation: 'バーの向き',
        bar_position: 'バーの位置',
        bar_single_line: '1行で情報を表示',
        bar_size: 'バーサイズ',
        bar_segments: 'Bar segments',
        bar_color_mode: 'カラーモード',
        bar_scale: 'Bar scale',
        center_zero: 'ゼロを中央に',
        center_zero_value: '中心値',
        center_zero_growth_percent: '成長率',
        color: 'メインカラー',
        decimal: '小数点',
        double_tap_action: 'ダブルタップしたときの動作',
        entity: 'エンティティ',
        force_circular_background: '円形の背景を強制する',
        hide_jinja: '非表示 (Jinjaモード)',
        hold_action: '長押ししたときの動作',
        icon: 'アイコン',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'アイコンをダブルタップしたときの動作',
        icon_hold_action: 'アイコンを長押ししたときの動作',
        icon_tap_action: 'アイコンをタップしたときの動作',
        layout: 'コンテンツのレイアウト',
        max_value: '最大値',
        min_value: '最小値',
        name: '名前',
        percent: 'パーセント',
        reverse_secondary_info_row: 'バーとテキストを入れ替える',
        secondary: '補足情報',
        state_content: '状態の内容',
        show_all_actions: 'すべての操作を表示',
        tap_action: '短くタップしたときの動作',
        text_shadow: 'テキストに影を追加',
        theme_mode: 'Theme mode',
        theme: 'テーマ',
        custom_theme: 'Custom theme zones',
        unit: '単位',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'カスタム補助情報',
        multiline: 'Multiline',
        interpolate: '色の補間',
        name_info: 'カスタム名前情報',
        reverse: 'タイマーを逆にする',
        bar_stack_mode: 'Stack mode',
        bar_stack: '追加エンティティ',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: '左から右',
          rtl: '右から左',
          up: '上方向'
        },
        bar_position: {
          below: 'コンテンツの下にバー',
          bottom: '下部にバー',
          default: 'デフォルト',
          overlay: 'コンテンツに重ねてバー（オーバーレイ）',
          top: '上部にバー',
          background: 'カードの背景'
        },
        bar_size: {
          large: '大',
          medium: '中',
          small: '小',
          xlarge: '特大'
        },
        layout: {
          horizontal: '水平（デフォルト）',
          vertical: '垂直'
        },
        theme: {
          humidity: '湿度',
          light: '明るさ',
          optimal_when_high: '高い時が最適（バッテリーなど）',
          optimal_when_low: '低い時が最適（CPU、RAMなど）',
          pm25: 'PM2.5',
          temperature: '温度',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: '自動',
          segment: 'セグメント',
          rainbow: 'レインボー'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: '角丸',
          glass: 'ガラス',
          gradient: 'グラデーション',
          gradient_reverse: '逆グラデーション',
          shimmer: 'シマー',
          shimmer_reverse: '逆シマー'
        },
        hide: {
          icon: 'アイコン',
          name: '名前',
          value: '値',
          unit: '単位',
          secondary_info: '補足情報',
          progress_bar: 'バー'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  ko: {
    card: {
      msg: {
        appliedDefaultValue: '기본값이 자동으로 적용되었습니다.',
        attributeNotFound: 'Home Assistant에서 속성을 찾을 수 없습니다.',
        entityNotFound: 'Home Assistant에서 엔티티를 찾을 수 없습니다.',
        invalidActionObject: '액션 객체가 잘못되었거나 구조가 올바르지 않습니다.',
        invalidDecimal: '값은 유효한 소수여야 합니다.',
        invalidEntityId: '엔티티 ID가 잘못되었거나 형식이 잘못되었습니다.',
        invalidEnumValue: '제공된 값이 허용된 옵션 중 하나가 아닙니다.',
        invalidStateContent: '상태 콘텐츠가 잘못되었거나 형식이 잘못되었습니다.',
        invalidStateContentEntry: '상태 콘텐츠에 하나 이상의 잘못된 항목이 있습니다.',
        invalidTheme: '지정된 테마를 알 수 없습니다. 기본 테마가 사용됩니다.',
        invalidTypeArray: '배열 유형의 값이 필요합니다.',
        invalidTypeBoolean: '불리언 유형의 값이 필요합니다.',
        invalidTypeNumber: '숫자 유형의 값이 필요합니다.',
        invalidTypeObject: '객체 유형의 값이 필요합니다.',
        invalidTypeString: '문자열 유형의 값이 필요합니다.',
        invalidUnionType: '값이 허용된 유형 중 어떤 것과도 일치하지 않습니다.',
        missingActionKey: '액션 객체에 필수 키가 없습니다.',
        missingRequiredProperty: '필수 속성이 누락되었습니다.'
      }
    },
    editor: {
      title: {
        content: '콘텐츠',
        interaction: '상호작용',
        theme: '테마 및 스타일'
      },
      field: {
        attribute: '속성',
        badge_color: '배지 색상',
        badge_icon: '배지 아이콘',
        bar_color: '바 색상',
        bar_effect_jinja: '바 효과 (Jinja 모드)',
        bar_orientation: '바 방향',
        bar_position: '바 위치',
        bar_single_line: '한 줄로 정보 표시',
        bar_size: '바 크기',
        bar_segments: 'Bar segments',
        bar_color_mode: '색상 모드',
        bar_scale: 'Bar scale',
        center_zero: '중앙에 영점',
        center_zero_value: '중앙값',
        center_zero_growth_percent: '성장률',
        color: '기본 색상',
        decimal: '소수점',
        double_tap_action: '더블 탭 시 동작',
        entity: '엔티티',
        force_circular_background: '원형 배경 강제 적용',
        hide_jinja: '숨기기 (Jinja 모드)',
        hold_action: '길게 누를 시 동작',
        icon: '아이콘',
        icon_animation: 'Icon animation',
        icon_double_tap_action: '아이콘 더블 탭 시 동작',
        icon_hold_action: '아이콘 길게 누를 시 동작',
        icon_tap_action: '아이콘 탭 시 동작',
        layout: '콘텐츠 레이아웃',
        max_value: '최대값',
        min_value: '최소값',
        name: '이름',
        percent: '퍼센트',
        reverse_secondary_info_row: '막대와 텍스트 교체',
        secondary: '보조 정보',
        state_content: '상태 콘텐츠',
        show_all_actions: '모든 액션 표시',
        tap_action: '짧게 탭 시 동작',
        text_shadow: '텍스트 그림자 추가',
        theme_mode: 'Theme mode',
        theme: '테마',
        custom_theme: 'Custom theme zones',
        unit: '단위',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: '사용자 정의 보조 정보',
        multiline: 'Multiline',
        interpolate: '색상 보간',
        name_info: '사용자 정의 이름 정보',
        reverse: '타이머 역방향',
        bar_stack_mode: 'Stack mode',
        bar_stack: '추가 엔티티',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: '왼쪽에서 오른쪽',
          rtl: '오른쪽에서 왼쪽',
          up: '위쪽 방향'
        },
        bar_position: {
          below: '콘텐츠 아래 바',
          bottom: '하단 바',
          default: '기본',
          overlay: '콘텐츠 위에 바 (오버레이)',
          top: '상단 바',
          background: '카드 배경'
        },
        bar_size: {
          large: '큰',
          medium: '중간',
          small: '작은',
          xlarge: '매우 큰'
        },
        layout: {
          horizontal: '수평 (기본)',
          vertical: '수직'
        },
        theme: {
          humidity: '습도',
          light: '조도',
          optimal_when_high: '높을 때 최적 (배터리 등)',
          optimal_when_low: '낮을 때 최적 (CPU, RAM 등)',
          pm25: 'PM2.5',
          temperature: '온도',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: '자동',
          segment: '세그먼트',
          rainbow: '무지개'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: '둥근 모서리',
          glass: '유리',
          gradient: '그라디언트',
          gradient_reverse: '역 그라디언트',
          shimmer: '시머',
          shimmer_reverse: '역 시머'
        },
        hide: {
          icon: '아이콘',
          name: '이름',
          value: '값',
          unit: '단위',
          secondary_info: '부가 정보',
          progress_bar: '바'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  lt: {
    card: {
      msg: {
        appliedDefaultValue: 'Numatytoji reikšmė buvo automatiškai pritaikyta.',
        attributeNotFound: 'Atributas nerastas Home Assistant.',
        entityNotFound: 'Entity nerasta Home Assistant.',
        invalidActionObject: 'Veiksmo objektas negalioja arba neteisingai suformuotas.',
        invalidDecimal: 'Reikšmė turi būti teigiamas sveikasis skaičius.',
        invalidEntityId: 'Entity ID negalioja arba neteisingas.',
        invalidEnumValue: 'Pateikta reikšmė nėra tarp leidžiamų parinkčių.',
        invalidStateContent: 'Būsenos turinys negalioja arba neteisingai suformuotas.',
        invalidStateContentEntry: 'Viena ar daugiau būsenos turinio įrašų negalioja.',
        invalidTheme: 'Nurodyta tema nežinoma. Bus naudojama numatytoji tema.',
        invalidTypeArray: 'Tikėtasi masyvo tipo reikšmės.',
        invalidTypeBoolean: 'Tikėtasi loginės reikšmės (boolean).',
        invalidTypeNumber: 'Tikėtasi skaičiaus tipo reikšmės.',
        invalidTypeObject: 'Tikėtasi objekto tipo reikšmės.',
        invalidTypeString: 'Tikėtasi eilutės tipo reikšmės.',
        invalidUnionType: 'Reikšmė neatitinka nė vieno leidžiamo tipo.',
        missingActionKey: 'Trūksta privalomo rakto veiksmo objekte.',
        missingRequiredProperty: 'Trūksta privalomos savybės.'
      }
    },
    editor: {
      title: {
        content: 'Turinys',
        interaction: 'Sąveikos',
        theme: 'Išvaizda ir naudojamumas'
      },
      field: {
        attribute: 'Atributas',
        badge_color: 'Ženklelio spalva',
        badge_icon: 'Ženklelio ikona',
        bar_color: 'Juostos spalva',
        bar_effect_jinja: 'Juostos efektas (Jinja režimas)',
        bar_orientation: 'Juostos orientacija',
        bar_position: 'Juostos pozicija',
        bar_single_line: 'Informacija vienoje eilutėje',
        bar_size: 'Juostos dydis',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Spalvos režimas',
        bar_scale: 'Bar scale',
        center_zero: 'Nulis centre',
        center_zero_value: 'Centro reikšmė',
        center_zero_growth_percent: 'Augimo procentas',
        color: 'Ikonos spalva',
        decimal: 'Dešimtainė',
        double_tap_action: 'Dviejų bakstelėjimų veiksmas',
        entity: 'Entity',
        force_circular_background: 'Priversti apvalų foną',
        hide_jinja: 'Slėpti (Jinja režimas)',
        hold_action: 'Ilgo paspaudimo veiksmas',
        icon: 'Ikona',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Ikonos dviejų bakstelėjimų veiksmas',
        icon_hold_action: 'Ikonos ilgo paspaudimo veiksmas',
        icon_tap_action: 'Ikonos bakstelėjimo veiksmas',
        layout: 'Turinio išdėstymas',
        max_value: 'Maksimali reikšmė',
        min_value: 'Minimali reikšmė',
        name: 'Pavadinimas',
        percent: 'Procentai',
        reverse_secondary_info_row: 'Sukeisti juostą ir tekstą',
        secondary: 'Papildoma informacija',
        state_content: 'Būsenos turinys',
        show_all_actions: 'Rodyti visus veiksmus',
        tap_action: 'Bakstelėjimo veiksmas',
        text_shadow: 'Pridėti teksto šešėlį',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Custom theme zones',
        unit: 'Vienetas',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Pasirinktinė papildoma informacija',
        multiline: 'Multiline',
        interpolate: 'Spalvų interpoliavimas',
        name_info: 'Pasirinktinė pavadinimo informacija',
        reverse: 'Atvirkštinis laikmatis',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Papildomos esybės',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimalu esant žemoms reikšmėms (CPU, RAM...)',
          optimal_when_high: 'Optimalu esant aukštoms reikšmėms (Baterija...)',
          light: 'Šviesi',
          temperature: 'Temperatūra',
          humidity: 'Drėgmė',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Maža',
          medium: 'Vidutinė',
          large: 'Didelė',
          xlarge: 'Labai didelė'
        },
        bar_orientation: {
          ltr: 'Iš kairės į dešinę',
          rtl: 'Iš dešinės į kairę',
          up: 'Į viršų'
        },
        bar_position: {
          default: 'Numatyta',
          below: 'Juosta po turiniu',
          top: 'Juosta viršuje',
          bottom: 'Juosta apačioje',
          overlay: 'Juosta ant turinio (overlay)',
          background: 'Kortelės fonas'
        },
        layout: {
          horizontal: 'Horizontalus (numatyta)',
          vertical: 'Vertikalus'
        },
        bar_color_mode: {
          auto: 'Automatinis',
          segment: 'Segmentai',
          rainbow: 'Vaivorykštė'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Suapvalinti kampai',
          glass: 'Stiklas',
          gradient: 'Gradientas',
          gradient_reverse: 'Apverstas gradientas',
          shimmer: 'Blizgesys',
          shimmer_reverse: 'Apverstas blizgesys'
        },
        hide: {
          icon: 'Piktograma',
          name: 'Pavadinimas',
          value: 'Reikšmė',
          unit: 'Vienetas',
          secondary_info: 'Info',
          progress_bar: 'Juosta'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  lv: {
    card: {
      msg: {
        appliedDefaultValue: 'Noklusējuma vērtība tika automātiski piemērota.',
        attributeNotFound: 'Atribūts nav atrasts Home Assistant.',
        entityNotFound: 'Vienība nav atrasta Home Assistant.',
        invalidActionObject: 'Darbības objekts nav derīgs vai ir nepareizi strukturēts.',
        invalidDecimal: 'Vērtībai jābūt pozitīvam veselajam skaitlim.',
        invalidEntityId: 'Vienības ID nav derīgs vai ir nepareizs.',
        invalidEnumValue: 'Ievadītā vērtība nav atļauto opciju sarakstā.',
        invalidStateContent: 'Stāvokļa saturs nav derīgs vai ir nepareizi strukturēts.',
        invalidStateContentEntry: 'Viena vai vairākas stāvokļa satura ievades nav derīgas.',
        invalidTheme: 'Norādītā tēma nav zināma. Tiks izmantota noklusējuma tēma.',
        invalidTypeArray: 'Tika gaidīta masīva tipa vērtība.',
        invalidTypeBoolean: 'Tika gaidīta loģiska (boolean) vērtība.',
        invalidTypeNumber: 'Tika gaidīta skaitļa tipa vērtība.',
        invalidTypeObject: 'Tika gaidīta objekta tipa vērtība.',
        invalidTypeString: 'Tika gaidīta virknes tipa vērtība.',
        invalidUnionType: 'Vērtība neatbilst nevienam atļautajam tipam.',
        missingActionKey: 'Trūkst obligātā atslēga darbības objektā.',
        missingRequiredProperty: 'Trūkst obligātā īpašība.'
      }
    },
    editor: {
      title: {
        content: 'Saturs',
        interaction: 'Saskarsme',
        theme: 'Izskats un lietojamība'
      },
      field: {
        attribute: 'Atribūts',
        badge_color: 'Žetona krāsa',
        badge_icon: 'Žetona ikona',
        bar_color: 'Joslas krāsa',
        bar_effect_jinja: 'Joslas efekts (Jinja režīms)',
        bar_orientation: 'Joslas orientācija',
        bar_position: 'Joslas pozīcija',
        bar_single_line: 'Informācija vienā rindā',
        bar_size: 'Joslas izmērs',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Krāsas režīms',
        bar_scale: 'Bar scale',
        center_zero: 'Nulles centrā',
        center_zero_value: 'Centra vērtība',
        center_zero_growth_percent: 'Pieauguma procents',
        color: 'Ikonas krāsa',
        decimal: 'Decimāldaļa',
        double_tap_action: 'Divreiz pieskaroties',
        entity: 'Vienība',
        force_circular_background: 'Piespiest apļu fonu',
        hide_jinja: 'Slēpt (Jinja režīms)',
        hold_action: 'Ilgs pieskāriens',
        icon: 'Ikona',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Ikonas dubults pieskāriens',
        icon_hold_action: 'Ikonas ilgs pieskāriens',
        icon_tap_action: 'Ikonas pieskāriens',
        layout: 'Satura izkārtojums',
        max_value: 'Maksimālā vērtība',
        min_value: 'Minimālā vērtība',
        name: 'Nosaukums',
        percent: 'Procenti',
        reverse_secondary_info_row: 'Mainīt joslu un tekstu',
        secondary: 'Papildu informācija',
        state_content: 'Stāvokļa saturs',
        show_all_actions: 'Rādīt visas darbības',
        tap_action: 'Pieskāriens',
        text_shadow: 'Pievienot teksta ēnu',
        theme_mode: 'Theme mode',
        theme: 'Tēma',
        custom_theme: 'Custom theme zones',
        unit: 'Vienība',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Pielāgota sekundārā informācija',
        multiline: 'Multiline',
        interpolate: 'Krāsu interpolācija',
        name_info: 'Pielāgota nosaukuma informācija',
        reverse: 'Apgriezts taimeris',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Papildu entītijas',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimāli pie zemām vērtībām (CPU, RAM...)',
          optimal_when_high: 'Optimāli pie augstām vērtībām (Akumulators...)',
          light: 'Gaiša',
          temperature: 'Temperatūra',
          humidity: 'Mitrums',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Mazs',
          medium: 'Vidējs',
          large: 'Liels',
          xlarge: 'Ļoti liels'
        },
        bar_orientation: {
          ltr: 'No kreisās uz labo',
          rtl: 'No labās uz kreiso',
          up: 'Uz augšu'
        },
        bar_position: {
          default: 'Noklusētais',
          below: 'Josla zem satura',
          top: 'Josla augšā',
          bottom: 'Josla apakšā',
          overlay: 'Josla virs satura (overlay)',
          background: 'Kartes fons'
        },
        layout: {
          horizontal: 'Horizontāls (noklusēts)',
          vertical: 'Vertikāls'
        },
        bar_color_mode: {
          auto: 'Automātisks',
          segment: 'Segmenti',
          rainbow: 'Varavīksne'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Noapaļoti stūri',
          glass: 'Stikls',
          gradient: 'Gradients',
          gradient_reverse: 'Apgriezts gradients',
          shimmer: 'Mirdzums',
          shimmer_reverse: 'Apgriezts mirdzums'
        },
        hide: {
          icon: 'Ikona',
          name: 'Nosaukums',
          value: 'Vērtība',
          unit: 'Vienība',
          secondary_info: 'Info',
          progress_bar: 'Josla'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  mk: {
    card: {
      msg: {
        appliedDefaultValue: 'Автоматски е применета стандардна вредност.',
        attributeNotFound: 'Атрибутот не е пронајден во Home Assistant.',
        entityNotFound: 'Ентитетот не е пронајден во Home Assistant.',
        invalidActionObject: 'Објектот за акција е невалиден или неправилно структуриран.',
        invalidDecimal: 'Вредноста мора да биде валиден децимален број.',
        invalidEntityId: 'ID-то на ентитетот е невалидно или лошо форматирано.',
        invalidEnumValue: 'Дадената вредност не е дозволена опција.',
        invalidStateContent: 'Состојбата е невалидна или лошо форматирана.',
        invalidStateContentEntry: 'Еден или повеќе елементи во состојбата се невалидни.',
        invalidTheme: 'Темата е непозната. Ќе се користи стандардна тема.',
        invalidTypeArray: 'Се очекуваше вредност од тип низа.',
        invalidTypeBoolean: 'Се очекуваше вредност од тип boolean.',
        invalidTypeNumber: 'Се очекуваше вредност од тип број.',
        invalidTypeObject: 'Се очекуваше вредност од тип објект.',
        invalidTypeString: 'Се очекуваше вредност од тип string.',
        invalidUnionType: 'Вредноста не одговара на дозволените типови.',
        missingActionKey: 'Недостасува потребен клуч во објектот за акција.',
        missingRequiredProperty: 'Недостасува потребно својство.'
      }
    },
    editor: {
      title: {
        content: 'Содржина',
        interaction: 'Интеракции',
        theme: 'Изглед и функционалност'
      },
      field: {
        attribute: 'Атрибут',
        badge_color: 'Боја на значка',
        badge_icon: 'Икона на значка',
        bar_color: 'Боја за лентата',
        bar_effect_jinja: 'Ефект на лентата (Jinja режим)',
        bar_orientation: 'Ориентација на лентата',
        bar_position: 'Позиција на лентата',
        bar_single_line: 'Инфо во еден ред',
        bar_size: 'Големина на лента',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Режим на боја',
        bar_scale: 'Bar scale',
        center_zero: 'Нула во центарот',
        center_zero_value: 'Централна вредност',
        center_zero_growth_percent: 'Процент на растеж',
        color: 'Примарна боја',
        decimal: 'децемален',
        double_tap_action: 'Дејство при двоен допир',
        entity: 'Ентитет',
        force_circular_background: 'Принуди кружна позадина',
        hide_jinja: 'Сокриј (Jinja режим)',
        hold_action: 'Дејство при долг допир',
        icon: 'Икона',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Дејство при двоен допир на иконата',
        icon_hold_action: 'Дејство при долг допир на иконата',
        icon_tap_action: 'Дејство при допир на иконата',
        layout: 'Распоред на содржината',
        max_value: 'Максимална вредност',
        min_value: 'Минимална вредност',
        name: 'Име',
        percent: 'Процент',
        reverse_secondary_info_row: 'Сменете ги лентата и текстот',
        secondary: 'Секундарни информации',
        state_content: 'Содржина на состојба',
        show_all_actions: 'Прикажи ги сите дејства',
        tap_action: 'Дејство при краток допир',
        text_shadow: 'Додај сенка на текст',
        theme_mode: 'Theme mode',
        theme: 'Тема',
        custom_theme: 'Custom theme zones',
        unit: 'Јединство',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Прилагодена секундарна информација',
        multiline: 'Multiline',
        interpolate: 'Интерполација на бои',
        name_info: 'Прилагодена информација за имиња',
        reverse: 'Обратен тајмер',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Дополнителни ентитети',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'Лево кон десно',
          rtl: 'Десно кон лево',
          up: 'Нагоре'
        },
        bar_position: {
          below: 'Лента под содржината',
          bottom: 'Лента на дното',
          default: 'Стандардно',
          overlay: 'Лента преку содржината (overlay)',
          top: 'Лента на врвот',
          background: 'Позадина на картичката'
        },
        bar_size: {
          large: 'Голема',
          medium: 'Средна',
          small: 'Мала',
          xlarge: 'Многу голема'
        },
        layout: {
          horizontal: 'Хоризонтално (стандардно)',
          vertical: 'Вертикално'
        },
        theme: {
          humidity: 'Влажност',
          light: 'Светлина',
          optimal_when_high: 'Оптимално кога е високо (Батерија...)',
          optimal_when_low: 'Оптимално кога е ниско(CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'Температура',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Автоматски',
          segment: 'Сегменти',
          rainbow: 'Виножито'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Заоблени агли',
          glass: 'Стакло',
          gradient: 'Градиент',
          gradient_reverse: 'Обратен градиент',
          shimmer: 'Сјај',
          shimmer_reverse: 'Обратен сјај'
        },
        hide: {
          icon: 'Икона',
          name: 'Име',
          value: 'Вредност',
          unit: 'Единица',
          secondary_info: 'Инфо',
          progress_bar: 'Лента'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  nb: {
    card: {
      msg: {
        appliedDefaultValue: 'En standardverdi har blitt brukt automatisk.',
        attributeNotFound: 'Attributtet ble ikke funnet i Home Assistant.',
        entityNotFound: 'Enheten ble ikke funnet i Home Assistant.',
        invalidActionObject: 'Handlingsobjektet er ugyldig eller feil strukturert.',
        invalidDecimal: 'Verdien må være et gyldig desimaltall.',
        invalidEntityId: 'Enhets-ID er ugyldig eller feil formatert.',
        invalidEnumValue: 'Den oppgitte verdien er ikke en gyldig mulighet.',
        invalidStateContent: 'Tilstandsinnholdet er ugyldig eller feil formatert.',
        invalidStateContentEntry: 'En eller flere oppføringer i tilstandsinnholdet er ugyldige.',
        invalidTheme: 'Angitt tema er ukjent. Standardtema vil bli brukt.',
        invalidTypeArray: 'Forventet en verdi av typen array.',
        invalidTypeBoolean: 'Forventet en boolsk verdi.',
        invalidTypeNumber: 'Forventet en numerisk verdi.',
        invalidTypeObject: 'Forventet en verdi av typen objekt.',
        invalidTypeString: 'Forventet en verdi av typen string.',
        invalidUnionType: 'Verdien samsvarer ikke med noen av de tillatte typene.',
        missingActionKey: 'En påkrevd nøkkel mangler i handlingsobjektet.',
        missingRequiredProperty: 'En påkrevd egenskap mangler.'
      }
    },
    editor: {
      title: {
        content: 'Innhold',
        interaction: 'Interaksjoner',
        theme: 'Utseende og funksjonalitet'
      },
      field: {
        attribute: 'Attributt',
        badge_color: 'Farge på merke',
        badge_icon: 'Ikon for merke',
        bar_color: 'Farge for baren',
        bar_effect_jinja: 'Effekt på baren (Jinja-modus)',
        bar_orientation: 'Orientering av baren',
        bar_position: 'Posisjon for baren',
        bar_single_line: 'Info på én linje',
        bar_size: 'Bar størrelse',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Fargemodus',
        bar_scale: 'Bar scale',
        center_zero: 'Null i midten',
        center_zero_value: 'Senterverdi',
        center_zero_growth_percent: 'Vekstprosent',
        color: 'Primærfarge',
        decimal: 'desimal',
        double_tap_action: 'Handling ved dobbelt trykk',
        entity: 'Enhet',
        force_circular_background: 'Tving sirkulær bakgrunn',
        hide_jinja: 'Skjul (Jinja-modus)',
        hold_action: 'Handling ved langt trykk',
        icon: 'Ikon',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Handling ved dobbelt trykk på ikonet',
        icon_hold_action: 'Handling ved langt trykk på ikonet',
        icon_tap_action: 'Handling ved trykk på ikonet',
        layout: 'Innholdslayout',
        max_value: 'Maksimal verdi',
        min_value: 'Minste verdi',
        name: 'Navn',
        percent: 'Prosent',
        reverse_secondary_info_row: 'Bytt linje og tekst',
        secondary: 'Sekundær informasjon',
        state_content: 'Innhold i tilstand',
        show_all_actions: 'Vis alle handlinger',
        tap_action: 'Handling ved kort trykk',
        text_shadow: 'Legg til tekstskygge',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Custom theme zones',
        unit: 'Enhet',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Egendefinert sekundær info',
        multiline: 'Multiline',
        interpolate: 'Interpoler farger',
        name_info: 'Egendefinert navneinfo',
        reverse: 'Omvendt tidtaker',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Ekstra enheter',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'Venstre til høyre',
          rtl: 'Høyre til venstre',
          up: 'Oppover'
        },
        bar_position: {
          below: 'Bar under innholdet',
          bottom: 'Bar nederst',
          default: 'Standard',
          overlay: 'Bar lagt over innholdet (overlay)',
          top: 'Bar øverst',
          background: 'Kortbakgrunn'
        },
        bar_size: {
          large: 'Stor',
          medium: 'Medium',
          small: 'Liten',
          xlarge: 'Ekstra stor'
        },
        layout: {
          horizontal: 'Horisontal (standard)',
          vertical: 'Vertikal'
        },
        theme: {
          humidity: 'Fuktighet',
          light: 'Lys',
          optimal_when_high: 'Optimal når høyt (Batteri...)',
          optimal_when_low: 'Optimal når lavt (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'Temperatur',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Auto',
          segment: 'Segmenter',
          rainbow: 'Regnbue'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Avrundede hjørner',
          glass: 'Glass',
          gradient: 'Gradient',
          gradient_reverse: 'Omvendt gradient',
          shimmer: 'Glans',
          shimmer_reverse: 'Omvendt glans'
        },
        hide: {
          icon: 'Ikon',
          name: 'Navn',
          value: 'Verdi',
          unit: 'Enhet',
          secondary_info: 'Info',
          progress_bar: 'Stolpe'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  nl: {
    card: {
      msg: {
        appliedDefaultValue: 'Een standaardwaarde is automatisch toegepast.',
        attributeNotFound: 'Attribuut niet gevonden in Home Assistant.',
        entityNotFound: 'Entiteit niet gevonden in Home Assistant.',
        invalidActionObject: 'Het actieobject is ongeldig of onjuist gestructureerd.',
        invalidDecimal: 'De waarde moet een geldig decimaal getal zijn.',
        invalidEntityId: 'De entity ID is ongeldig of foutief geformatteerd.',
        invalidEnumValue: 'De opgegeven waarde is geen geldige optie.',
        invalidStateContent: 'De statusinhoud is ongeldig of foutief.',
        invalidStateContentEntry: 'Een of meer onderdelen van de statusinhoud zijn ongeldig.',
        invalidTheme: 'Het opgegeven thema is onbekend. Het standaardthema wordt gebruikt.',
        invalidTypeArray: 'Verwachte waarde van het type array.',
        invalidTypeBoolean: 'Verwachte waarde van het type boolean.',
        invalidTypeNumber: 'Verwachte waarde van het type nummer.',
        invalidTypeObject: 'Verwachte waarde van het type object.',
        invalidTypeString: 'Verwachte waarde van het type string.',
        invalidUnionType: 'De waarde komt niet overeen met toegestane types.',
        missingActionKey: 'Er ontbreekt een verplichte sleutel in het actieobject.',
        missingRequiredProperty: 'Vereiste eigenschap ontbreekt.'
      }
    },
    editor: {
      title: {
        content: 'Inhoud',
        interaction: 'Interactie',
        theme: 'Uiterlijk en gebruiksgemak'
      },
      field: {
        attribute: 'Attribuut',
        badge_color: 'Kleur van badge',
        badge_icon: 'Pictogram van badge',
        bar_color: 'Kleur van de balk',
        bar_effect_jinja: 'Effect op de balk (Jinja-modus)',
        bar_orientation: 'Oriëntatie van de balk',
        bar_position: 'Positie van de balk',
        bar_single_line: 'Info op één regel',
        bar_size: 'Balkgrootte',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Balkkleurmodus',
        bar_scale: 'Balkschaal',
        center_zero: 'Nul in het midden',
        center_zero_value: 'Centrumwaarde',
        center_zero_growth_percent: 'Groeipercentage',
        color: 'Kleur van het pictogram',
        decimal: 'decimaal',
        double_tap_action: 'Actie bij dubbel tikken',
        entity: 'Entiteit',
        force_circular_background: 'Geforceerde cirkelvormige achtergrond',
        hide_jinja: 'Verbergen (Jinja-modus)',
        hold_action: 'Actie bij lang ingedrukt houden',
        icon: 'Pictogram',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Actie bij dubbel tikken op pictogram',
        icon_hold_action: 'Actie bij lang ingedrukt houden op pictogram',
        icon_tap_action: 'Actie bij tikken op pictogram',
        layout: 'Inhoudsindeling',
        max_value: 'Maximale waarde',
        min_value: 'Minimale waarde',
        name: 'Naam',
        percent: 'Percentage',
        reverse_secondary_info_row: 'Balk en tekst omwisselen',
        secondary: 'Secundaire informatie',
        state_content: 'Inhoud van de status',
        show_all_actions: 'Toon alle acties',
        tap_action: 'Actie bij korte tik',
        text_shadow: 'Tekstschaduw toevoegen',
        theme_mode: 'Theme mode',
        theme: 'Thema',
        custom_theme: 'Aangepaste themazones',
        unit: 'Eenheid',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Aangepaste secundaire info',
        multiline: 'Meerdere regels',
        interpolate: 'Kleuren interpoleren',
        name_info: 'Aangepaste naaminfo',
        reverse: 'Timer omdraaien',
        bar_stack_mode: 'Stapelmodus',
        bar_stack: 'Extra entiteiten',
        migrate_config: 'Configuratie migreren'
      },
      option: {
        bar_orientation: {
          ltr: 'Links naar rechts',
          rtl: 'Rechts naar links',
          up: 'Omhoog'
        },
        bar_position: {
          below: 'Balk onder de inhoud',
          bottom: 'Balk onderaan',
          default: 'Standaard',
          overlay: 'Balk over de inhoud (overlay)',
          top: 'Balk bovenaan',
          background: 'Kaartachtergrond'
        },
        bar_size: {
          large: 'Groot',
          medium: 'Middel',
          small: 'Klein',
          xlarge: 'Extra groot'
        },
        layout: {
          horizontal: 'Horizontaal (standaard)',
          vertical: 'Verticaal'
        },
        theme: {
          humidity: 'Vochtigheid',
          light: 'Licht',
          optimal_when_high: 'Optimaal wanneer hoog (Batterij...)',
          optimal_when_low: 'Optimaal wanneer laag (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'Temperatuur',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Automatisch',
          segment: 'Segmenten',
          rainbow: 'Regenboog'
        },
        bar_scale: {
          linear: 'Lineair',
          log: 'Logaritmisch'
        },
        bar_effect: {
          radius: 'Afgeronde hoeken',
          glass: 'Glas',
          gradient: 'Verloop',
          gradient_reverse: 'Omgekeerd verloop',
          shimmer: 'Glinstering',
          shimmer_reverse: 'Omgekeerde glinstering'
        },
        hide: {
          icon: 'Pictogram',
          name: 'Naam',
          value: 'Waarde',
          unit: 'Eenheid',
          secondary_info: 'Info',
          progress_bar: 'Balk'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Lage waarde',
          high: 'Hoge waarde',
          type: 'Type',
          opacity: 'Dekking',
          low_color: 'Lage kleur',
          high_color: 'Hoge kleur',
          low_as: 'Eenheid (lage waarde)',
          high_as: 'Eenheid (hoge waarde)',
          line_size: 'Lijndikte',
          disable_low: 'Lage waarde uitschakelen',
          disable_high: 'Hoge waarde uitschakelen',
          low_attribute: 'Attribuut',
          high_attribute: 'Attribuut'
        },
        icon_animation: {
          none: 'Geen',
          spin: 'Draaien',
          pulse: 'Pulseren',
          bounce: 'Stuiteren',
          shake: 'Trillen',
          ping: 'Ping',
          reveal: 'Onthullen',
          washing_machine: 'Wasmachine',
          battery_charging: 'Batterij wordt opgeladen'
        },
        alert_when: {
          above: 'Alarm boven',
          below: 'Alarm onder',
          color: 'Alarmkleur',
          highlight: 'Markering',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Rand',
          background: 'Achtergrond'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Vaste waarde',
          entity: 'Entiteit',
          jinja: 'Sjabloon'
        },
        max_value_mode: {
          standard: 'Vaste waarde',
          entity: 'Entiteit',
          jinja: 'Sjabloon'
        },
        watermark_low_mode: {
          standard: 'Vaste waarde',
          entity: 'Entiteit',
          jinja: 'Sjabloon'
        },
        watermark_high_mode: {
          standard: 'Vaste waarde',
          entity: 'Entiteit',
          jinja: 'Sjabloon'
        },
        theme_mode: {
          preset: 'Voorinstelling',
          custom: 'Aangepast'
        },
        min_value: {
          attribute: 'Attribuut'
        },
        max_value: {
          attribute: 'Attribuut'
        },
        bar_stack_mode: {
          stacked: 'Gestapeld',
          proportional: 'Proportioneel',
          net: 'Netto'
        }
      }
    }
  },
  pl: {
    card: {
      msg: {
        appliedDefaultValue: 'Zastosowano domyślną wartość automatycznie.',
        attributeNotFound: 'Nie znaleziono atrybutu w Home Assistant.',
        entityNotFound: 'Nie znaleziono encji w Home Assistant.',
        invalidActionObject: 'Obiekt akcji jest nieprawidłowy lub ma złą strukturę.',
        invalidDecimal: 'Wartość musi być poprawną liczbą dziesiętną.',
        invalidEntityId: 'ID encji jest nieprawidłowe lub ma zły format.',
        invalidEnumValue: 'Podana wartość nie jest jedną z dozwolonych opcji.',
        invalidStateContent: 'Zawartość stanu jest nieprawidłowa lub uszkodzona.',
        invalidStateContentEntry: 'Jedna lub więcej pozycji zawartości stanu jest nieprawidłowa.',
        invalidTheme: 'Podany motyw jest nieznany. Zostanie użyty domyślny motyw.',
        invalidTypeArray: 'Oczekiwano wartości typu tablica.',
        invalidTypeBoolean: 'Oczekiwano wartości typu boolean.',
        invalidTypeNumber: 'Oczekiwano wartości typu liczba.',
        invalidTypeObject: 'Oczekiwano wartości typu obiekt.',
        invalidTypeString: 'Oczekiwano wartości typu string.',
        invalidUnionType: 'Wartość nie pasuje do żadnego z dozwolonych typów.',
        missingActionKey: 'W obiekcie akcji brakuje wymaganej właściwości.',
        missingRequiredProperty: 'Brakuje wymaganej właściwości.'
      }
    },
    editor: {
      title: {
        content: 'Zawartość',
        interaction: 'Interakcje',
        theme: 'Wygląd i funkcjonalność'
      },
      field: {
        attribute: 'Atrybut',
        badge_color: 'Kolor odznaki',
        badge_icon: 'Ikona odznaki',
        bar_color: 'Kolor paska',
        bar_effect_jinja: 'Efekt na pasku (tryb Jinja)',
        bar_orientation: 'Orientacja paska',
        bar_position: 'Pozycja paska',
        bar_single_line: 'Info w jednej linii',
        bar_size: 'Rozmiar paska',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Tryb koloru',
        bar_scale: 'Bar scale',
        center_zero: 'Zero na środku',
        center_zero_value: 'Wartość środkowa',
        center_zero_growth_percent: 'Procent wzrostu',
        color: 'Kolor podstawowy',
        decimal: 'dziesiętny',
        double_tap_action: 'Akcja przy podwójnym naciśnięciu',
        entity: 'Encja',
        force_circular_background: 'Wymuś okrągłe tło',
        hide_jinja: 'Ukryj (tryb Jinja)',
        hold_action: 'Akcja przy długim naciśnięciu',
        icon: 'Ikona',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Akcja przy podwójnym naciśnięciu ikony',
        icon_hold_action: 'Akcja przy długim naciśnięciu ikony',
        icon_tap_action: 'Akcja przy naciśnięciu ikony',
        layout: 'Układ treści',
        max_value: 'Wartość maksymalna',
        min_value: 'Wartość minimalna',
        name: 'Nazwa',
        percent: 'Procent',
        reverse_secondary_info_row: 'Zamień pasek i tekst',
        secondary: 'Informacja dodatkowa',
        state_content: 'Zawartość stanu',
        show_all_actions: 'Pokaż wszystkie akcje',
        tap_action: 'Akcja przy krótkim naciśnięciu',
        text_shadow: 'Dodaj cień tekstu',
        theme_mode: 'Theme mode',
        theme: 'Motyw',
        custom_theme: 'Custom theme zones',
        unit: 'Jednostka',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Niestandardowa info pomocnicza',
        multiline: 'Multiline',
        interpolate: 'Interpolacja kolorów',
        name_info: 'Niestandardowa info nazwy',
        reverse: 'Odwróć licznik',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Dodatkowe encje',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'Od lewej do prawej',
          rtl: 'Od prawej do lewej',
          up: 'W górę'
        },
        bar_position: {
          below: 'Pasek pod zawartością',
          bottom: 'Pasek na dole',
          default: 'Domyślnie',
          overlay: 'Pasek nałożony na zawartość (overlay)',
          top: 'Pasek na górze',
          background: 'Tło karty'
        },
        bar_size: {
          large: 'Duża',
          medium: 'Średnia',
          small: 'Mała',
          xlarge: 'Bardzo duża'
        },
        layout: {
          horizontal: 'Poziomo (domyślnie)',
          vertical: 'Pionowy'
        },
        theme: {
          humidity: 'Wilgotność',
          light: 'Światło',
          optimal_when_high: 'Optymalny, gdy wysokie (Bateria...)',
          optimal_when_low: 'Optymalny, gdy niskie (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'Temperatura',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Automatycznie',
          segment: 'Segmenty',
          rainbow: 'Tęcza'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Zaokrąglone rogi',
          glass: 'Szkło',
          gradient: 'Gradient',
          gradient_reverse: 'Odwrócony gradient',
          shimmer: 'Połysk',
          shimmer_reverse: 'Odwrócony połysk'
        },
        hide: {
          icon: 'Ikona',
          name: 'Nazwa',
          value: 'Wartość',
          unit: 'Jednostka',
          secondary_info: 'Info',
          progress_bar: 'Pasek'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  'pt-BR': {
    card: {
      msg: {
        appliedDefaultValue: 'Um valor padrão foi aplicado automaticamente.',
        attributeNotFound: 'Atributo não encontrado no Home Assistant.',
        entityNotFound: 'Entidade não encontrada no Home Assistant.',
        invalidActionObject: 'O objeto de ação é inválido ou mal estruturado.',
        invalidDecimal: 'O valor deve ser um número inteiro positivo.',
        invalidEntityId: 'O ID da entidade é inválido ou mal formado.',
        invalidEnumValue: 'O valor fornecido não faz parte das opções permitidas.',
        invalidStateContent: 'O conteúdo do estado é inválido ou mal formado.',
        invalidStateContentEntry: 'Uma ou mais entradas do conteúdo do estado são inválidas.',
        invalidTheme: 'O tema especificado é desconhecido. O tema padrão será usado.',
        invalidTypeArray: 'Um valor do tipo array era esperado.',
        invalidTypeBoolean: 'Um valor do tipo booleano era esperado.',
        invalidTypeNumber: 'Um valor do tipo número era esperado.',
        invalidTypeObject: 'Um valor do tipo objeto era esperado.',
        invalidTypeString: 'Um valor do tipo string era esperado.',
        invalidUnionType: 'O valor não corresponde a nenhum dos tipos permitidos.',
        missingActionKey: 'Uma chave obrigatória está ausente no objeto de ação.',
        missingRequiredProperty: 'Uma propriedade obrigatória está ausente.'
      }
    },
    editor: {
      title: {
        content: 'Conteúdo',
        interaction: 'Interações',
        theme: 'Aparência e usabilidade'
      },
      field: {
        attribute: 'Atributo',
        badge_color: 'Cor do badge',
        badge_icon: 'Ícone do badge',
        bar_color: 'Cor da barra',
        bar_effect_jinja: 'Efeito na barra (modo Jinja)',
        bar_orientation: 'Orientação da barra',
        bar_position: 'Posição da barra',
        bar_single_line: 'Informações em uma linha',
        bar_size: 'Tamanho da barra',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Modo de cor',
        bar_scale: 'Bar scale',
        center_zero: 'Zero ao centro',
        center_zero_value: 'Valor central',
        center_zero_growth_percent: 'Percentual de crescimento',
        color: 'Cor do ícone',
        decimal: 'Decimal',
        double_tap_action: 'Ação ao tocar duas vezes',
        entity: 'Entidade',
        force_circular_background: 'Forçar fundo circular',
        hide_jinja: 'Ocultar (modo Jinja)',
        hold_action: 'Ação ao manter pressionado',
        icon: 'Ícone',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Ação ao tocar duas vezes no ícone',
        icon_hold_action: 'Ação ao manter pressionado o ícone',
        icon_tap_action: 'Ação ao tocar no ícone',
        layout: 'Layout do conteúdo',
        max_value: 'Valor máximo',
        min_value: 'Valor mínimo',
        name: 'Nome',
        percent: 'Porcentagem',
        reverse_secondary_info_row: 'Trocar barra e texto',
        secondary: 'Informação secundária',
        state_content: 'Conteúdo do estado',
        show_all_actions: 'Mostrar todas as ações',
        tap_action: 'Ação ao tocar',
        text_shadow: 'Adicionar sombra ao texto',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Custom theme zones',
        unit: 'Unidade',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Informação secundária personalizada',
        multiline: 'Multiline',
        interpolate: 'Interpolar cores',
        name_info: 'Informação de nome personalizada',
        reverse: 'Temporizador inverso',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Entidades adicionais',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Ideal quando baixo (CPU, RAM...)',
          optimal_when_high: 'Ideal quando alto (Bateria...)',
          light: 'Claro',
          temperature: 'Temperatura',
          humidity: 'Umidade',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Pequena',
          medium: 'Média',
          large: 'Grande',
          xlarge: 'Muito grande'
        },
        bar_orientation: {
          ltr: 'Esquerda para direita',
          rtl: 'Direita para esquerda',
          up: 'Para cima'
        },
        bar_position: {
          default: 'Padrão',
          below: 'Barra abaixo do conteúdo',
          top: 'Barra acima',
          bottom: 'Barra abaixo',
          overlay: 'Barra sobre o conteúdo (overlay)',
          background: 'Fundo do cartão'
        },
        layout: {
          horizontal: 'Horizontal (padrão)',
          vertical: 'Vertical'
        },
        bar_color_mode: {
          auto: 'Auto',
          segment: 'Segmentos',
          rainbow: 'Arco-Íris'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Cantos arredondados',
          glass: 'Vidro',
          gradient: 'Gradiente',
          gradient_reverse: 'Gradiente inverso',
          shimmer: 'Brilho',
          shimmer_reverse: 'Brilho inverso'
        },
        hide: {
          icon: 'Ícone',
          name: 'Nome',
          value: 'Valor',
          unit: 'Unidade',
          secondary_info: 'Info',
          progress_bar: 'Barra'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  pt: {
    card: {
      msg: {
        appliedDefaultValue: 'Um valor padrão foi aplicado automaticamente.',
        attributeNotFound: 'Atributo não encontrado no Home Assistant.',
        entityNotFound: 'Entidade não encontrada no Home Assistant.',
        invalidActionObject: 'O objeto de ação é inválido ou mal estruturado.',
        invalidDecimal: 'O valor deve ser um número decimal válido.',
        invalidEntityId: 'O ID da entidade é inválido ou mal formatado.',
        invalidEnumValue: 'O valor fornecido não é uma opção válida.',
        invalidStateContent: 'O conteúdo do estado é inválido ou mal formatado.',
        invalidStateContentEntry: 'Uma ou mais entradas do conteúdo do estado são inválidas.',
        invalidTheme: 'O tema especificado é desconhecido. Tema padrão será usado.',
        invalidTypeArray: 'Esperava-se um valor do tipo array.',
        invalidTypeBoolean: 'Esperava-se um valor do tipo booleano.',
        invalidTypeNumber: 'Esperava-se um valor do tipo número.',
        invalidTypeObject: 'Esperava-se um valor do tipo objeto.',
        invalidTypeString: 'Esperava-se um valor do tipo string.',
        invalidUnionType: 'O valor não corresponde a nenhum dos tipos permitidos.',
        missingActionKey: 'Uma chave obrigatória está faltando no objeto de ação.',
        missingRequiredProperty: 'Propriedade obrigatória ausente.'
      }
    },
    editor: {
      title: {
        content: 'Conteúdo',
        interaction: 'Interações',
        theme: 'Aparência e usabilidade'
      },
      field: {
        attribute: 'Atributo',
        badge_color: 'Cor do crachá',
        badge_icon: 'Ícone do crachá',
        bar_color: 'Cor da barra',
        bar_effect_jinja: 'Efeito na barra (modo Jinja)',
        bar_orientation: 'Orientação da barra',
        bar_position: 'Posição da barra',
        bar_single_line: 'Info numa só linha',
        bar_size: 'Tamanho da barra',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Modo de cor da barra',
        bar_scale: 'Escala da barra',
        center_zero: 'Zero no centro',
        center_zero_value: 'Valor central',
        center_zero_growth_percent: 'Percentagem de crescimento',
        color: 'Cor do ícone',
        decimal: 'decimal',
        double_tap_action: 'Ação ao toque duplo',
        entity: 'Entidade',
        force_circular_background: 'Forçar fundo circular',
        hide_jinja: 'Ocultar (modo Jinja)',
        hold_action: 'Ação ao toque longo',
        icon: 'Ícone',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Ação ao tocar duplamente no ícone',
        icon_hold_action: 'Ação ao manter o toque no ícone',
        icon_tap_action: 'Ação ao tocar no ícone',
        layout: 'Layout do conteúdo',
        max_value: 'Valor máximo',
        min_value: 'Valor mínimo',
        name: 'Nome',
        percent: 'Percentagem',
        reverse_secondary_info_row: 'Trocar barra e texto',
        secondary: 'Informação secundária',
        state_content: 'Conteúdo do estado',
        show_all_actions: 'Mostrar todas as ações',
        tap_action: 'Ação ao toque curto',
        text_shadow: 'Adicionar sombra ao texto',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Zonas de tema personalizado',
        unit: 'Unidade',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Informação secundária personalizada',
        multiline: 'Multilinha',
        interpolate: 'Interpolar cores',
        name_info: 'Informação de nome personalizada',
        reverse: 'Temporizador inverso',
        bar_stack_mode: 'Modo de empilhamento',
        bar_stack: 'Entidades adicionais',
        migrate_config: 'Migrar configuração'
      },
      option: {
        bar_orientation: {
          ltr: 'Da esquerda para a direita',
          rtl: 'Da direita para a esquerda',
          up: 'Para cima'
        },
        bar_position: {
          below: 'Barra abaixo do conteúdo',
          bottom: 'Barra em baixo',
          default: 'Padrão',
          overlay: 'Barra sobreposta ao conteúdo (overlay)',
          top: 'Barra em cima',
          background: 'Fundo do cartão'
        },
        bar_size: {
          large: 'Grande',
          medium: 'Média',
          small: 'Pequena',
          xlarge: 'Extra grande'
        },
        layout: {
          horizontal: 'Horizontal (padrão)',
          vertical: 'Vertical'
        },
        theme: {
          humidity: 'Humidade',
          light: 'Luz',
          optimal_when_high: 'Ótimo quando é alto (Bateria...)',
          optimal_when_low: 'Ótimo quando é baixo (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'Temperatura',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Auto',
          segment: 'Segmentos',
          rainbow: 'Arco-Íris'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarítmica'
        },
        bar_effect: {
          radius: 'Cantos arredondados',
          glass: 'Vidro',
          gradient: 'Gradiente',
          gradient_reverse: 'Gradiente inverso',
          shimmer: 'Brilho',
          shimmer_reverse: 'Brilho inverso'
        },
        hide: {
          icon: 'Ícone',
          name: 'Nome',
          value: 'Valor',
          unit: 'Unidade',
          secondary_info: 'Info',
          progress_bar: 'Barra'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Limite baixo',
          high: 'Limite alto',
          type: 'Tipo',
          opacity: 'Opacidade',
          low_color: 'Cor do limite baixo',
          high_color: 'Cor do limite alto',
          low_as: 'Unidade (limite baixo)',
          high_as: 'Unidade (limite alto)',
          line_size: 'Espessura da linha',
          disable_low: 'Desativar limite baixo',
          disable_high: 'Desativar limite alto',
          low_attribute: 'Atributo',
          high_attribute: 'Atributo'
        },
        icon_animation: {
          none: 'Nenhuma',
          spin: 'Girar',
          pulse: 'Pulsar',
          bounce: 'Saltar',
          shake: 'Vibração',
          ping: 'Ping',
          reveal: 'Revelar',
          washing_machine: 'Máquina de lavar',
          battery_charging: 'Bateria a carregar'
        },
        alert_when: {
          above: 'Alerta acima de',
          below: 'Alerta abaixo de',
          color: 'Cor do alerta',
          highlight: 'Destaque',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Borda',
          background: 'Fundo'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Valor fixo',
          entity: 'Entidade',
          jinja: 'Modelo'
        },
        max_value_mode: {
          standard: 'Valor fixo',
          entity: 'Entidade',
          jinja: 'Modelo'
        },
        watermark_low_mode: {
          standard: 'Valor fixo',
          entity: 'Entidade',
          jinja: 'Modelo'
        },
        watermark_high_mode: {
          standard: 'Valor fixo',
          entity: 'Entidade',
          jinja: 'Modelo'
        },
        theme_mode: {
          preset: 'Predefinido',
          custom: 'Personalizado'
        },
        min_value: {
          attribute: 'Atributo'
        },
        max_value: {
          attribute: 'Atributo'
        },
        bar_stack_mode: {
          stacked: 'Empilhado',
          proportional: 'Proporcional',
          net: 'Líquido'
        }
      }
    }
  },
  ro: {
    card: {
      msg: {
        appliedDefaultValue: 'A fost aplicată automat o valoare implicită.',
        attributeNotFound: 'Atributul nu a fost găsit în Home Assistant.',
        entityNotFound: 'Entitatea nu a fost găsită în Home Assistant.',
        invalidActionObject: 'Obiectul acțiune este invalid sau structurat incorect.',
        invalidDecimal: 'Valoarea trebuie să fie un număr zecimal valid.',
        invalidEntityId: 'ID-ul entității este invalid sau formatat greșit.',
        invalidEnumValue: 'Valoarea furnizată nu este una dintre opțiunile permise.',
        invalidStateContent: 'Conținutul stării este invalid sau formatat greșit.',
        invalidStateContentEntry: 'Una sau mai multe intrări în conținutul stării sunt invalide.',
        invalidTheme: 'Tema specificată este necunoscută. Va fi utilizată tema implicită.',
        invalidTypeArray: 'Se aștepta o valoare de tip array.',
        invalidTypeBoolean: 'Se aștepta o valoare de tip boolean.',
        invalidTypeNumber: 'Se aștepta o valoare de tip număr.',
        invalidTypeObject: 'Se aștepta o valoare de tip obiect.',
        invalidTypeString: 'Se aștepta o valoare de tip șir.',
        invalidUnionType: 'Valoarea nu se potrivește niciunui tip permis.',
        missingActionKey: 'Lipsește o cheie necesară în obiectul acțiune.',
        missingRequiredProperty: 'Lipsește o proprietate necesară.'
      }
    },
    editor: {
      title: {
        content: 'Conținut',
        interaction: 'Interacțiuni',
        theme: 'Aspect & Stil'
      },
      field: {
        attribute: 'Atribut',
        badge_color: 'Culoare insignă',
        badge_icon: 'Pictogramă insignă',
        bar_color: 'Culoare bară',
        bar_effect_jinja: 'Efect pe bară (mod Jinja)',
        bar_orientation: 'Orientarea barei',
        bar_position: 'Poziția barei',
        bar_single_line: 'Info pe un singur rând',
        bar_size: 'Dimensiunea barei',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Mod culoare',
        bar_scale: 'Bar scale',
        center_zero: 'Zero la centru',
        center_zero_value: 'Valoare centrală',
        center_zero_growth_percent: 'Procent de creștere',
        color: 'Culoare principală',
        decimal: 'zecimal',
        double_tap_action: 'Acțiune la apăsare dublă',
        entity: 'Entitate',
        force_circular_background: 'Forțează fundal circular',
        hide_jinja: 'Ascunde (mod Jinja)',
        hold_action: 'Acțiune la apăsare lungă',
        icon: 'Pictogramă',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Acțiune la apăsare dublă a pictogramei',
        icon_hold_action: 'Acțiune la apăsare lungă a pictogramei',
        icon_tap_action: 'Acțiune la apăsarea pictogramei',
        layout: 'Aspect conținut',
        max_value: 'Valoare maximă',
        min_value: 'Valoare minimă',
        name: 'Nume',
        percent: 'Procent',
        reverse_secondary_info_row: 'Schimbați bara și textul',
        secondary: 'Informație secundară',
        state_content: 'Conținutul stării',
        show_all_actions: 'Afișează toate acțiunile',
        tap_action: 'Acțiune la apăsare scurtă',
        text_shadow: 'Adaugă umbră textului',
        theme_mode: 'Theme mode',
        theme: 'Temă',
        custom_theme: 'Custom theme zones',
        unit: 'Unitate',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Info secundară personalizată',
        multiline: 'Multiline',
        interpolate: 'Interpolare culori',
        name_info: 'Info nume personalizată',
        reverse: 'Cronometru inverso',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Entități suplimentare',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'De la stânga la dreapta',
          rtl: 'De la dreapta la stânga',
          up: 'În sus'
        },
        bar_position: {
          below: 'Bară sub conținut',
          bottom: 'Bară jos',
          default: 'Implicit',
          overlay: 'Bară suprapusă peste conținut (overlay)',
          top: 'Bară sus',
          background: 'Fundal card'
        },
        bar_size: {
          large: 'Mare',
          medium: 'Medie',
          small: 'Mică',
          xlarge: 'Foarte mare'
        },
        layout: {
          horizontal: 'Orizontal (implicit)',
          vertical: 'Vertical'
        },
        theme: {
          humidity: 'Umiditate',
          light: 'Luminozitate',
          optimal_when_high: 'Optim când este ridicat (Baterie...)',
          optimal_when_low: 'Optim când este scăzut (CPU, RAM...)',
          pm25: 'PM2.5',
          temperature: 'Temperatură',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Automat',
          segment: 'Segmente',
          rainbow: 'Curcubeu'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Colțuri rotunjite',
          glass: 'Sticlă',
          gradient: 'Gradient',
          gradient_reverse: 'Gradient inversat',
          shimmer: 'Luciu',
          shimmer_reverse: 'Luciu inversat'
        },
        hide: {
          icon: 'Pictogramă',
          name: 'Nume',
          value: 'Valoare',
          unit: 'Unitate',
          secondary_info: 'Info',
          progress_bar: 'Bară'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  ru: {
    card: {
      msg: {
        appliedDefaultValue: 'Значение по умолчанию было применено автоматически.',
        attributeNotFound: 'Атрибут не найден в Home Assistant.',
        entityNotFound: 'Сущность не найдена в Home Assistant.',
        invalidActionObject: 'Объект действия недействителен или неправильно структурирован.',
        invalidDecimal: 'Значение должно быть действительным десятичным числом.',
        invalidEntityId: 'Идентификатор сущности недействителен или неправильно сформирован.',
        invalidEnumValue: 'Предоставленное значение не является одним из разрешённых вариантов.',
        invalidStateContent: 'Содержимое состояния недействительно или неправильно сформировано.',
        invalidStateContentEntry: 'Одна или несколько записей в содержимом состояния недействительны.',
        invalidTheme: 'Указанная тема неизвестна. Будет использована тема по умолчанию.',
        invalidTypeArray: 'Ожидается значение типа массив.',
        invalidTypeBoolean: 'Ожидается значение логического типа.',
        invalidTypeNumber: 'Ожидается значение числового типа.',
        invalidTypeObject: 'Ожидается значение типа объект.',
        invalidTypeString: 'Ожидается значение строкового типа.',
        invalidUnionType: 'Значение не соответствует ни одному из разрешённых типов.',
        missingActionKey: 'В объекте действия отсутствует обязательный ключ.',
        missingRequiredProperty: 'Отсутствует обязательное свойство.'
      }
    },
    editor: {
      title: {
        content: 'Содержимое',
        interaction: 'Взаимодействия',
        theme: 'Внешний вид'
      },
      field: {
        attribute: 'Атрибут',
        badge_color: 'Цвет значка',
        badge_icon: 'Иконка значка',
        bar_color: 'Цвет полосы',
        bar_effect_jinja: 'Эффект на полосе (режим Jinja)',
        bar_orientation: 'Ориентация полосы',
        bar_position: 'Положение полосы',
        bar_single_line: 'Информация в одну строку',
        bar_size: 'Размер полосы',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Режим цвета',
        bar_scale: 'Bar scale',
        center_zero: 'Ноль по центру',
        center_zero_value: 'Центральное значение',
        center_zero_growth_percent: 'Процент роста',
        color: 'Основной цвет',
        decimal: 'десятичные',
        double_tap_action: 'Поведение при двойном нажатии',
        entity: 'Сущность',
        force_circular_background: 'Принудительный круглый фон',
        hide_jinja: 'Скрыть (режим Jinja)',
        hold_action: 'Поведение при длительном нажатии',
        icon: 'Иконка',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Поведение при двойном нажатии на иконку',
        icon_hold_action: 'Поведение при длительном нажатии на иконку',
        icon_tap_action: 'Поведение при нажатии на иконку',
        layout: 'Расположение содержимого',
        max_value: 'Максимальное значение',
        min_value: 'Минимальное значение',
        name: 'Название',
        percent: 'Процент',
        reverse_secondary_info_row: 'Поменять местами панель и текст',
        secondary: 'Дополнительная информация',
        state_content: 'Содержимое состояния',
        show_all_actions: 'Показать все действия',
        tap_action: 'Поведение при нажатии',
        text_shadow: 'Добавить тень к тексту',
        theme_mode: 'Theme mode',
        theme: 'Тема',
        custom_theme: 'Custom theme zones',
        unit: 'Единица измерения',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Дополнительная информация',
        multiline: 'Multiline',
        interpolate: 'Интерполяция цветов',
        name_info: 'Доп. информация (имя)',
        reverse: 'Обратный таймер',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Дополнительные объекты',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'Слева направо',
          rtl: 'Справа налево',
          up: 'Вверх'
        },
        bar_position: {
          below: 'Полоса под содержимым',
          bottom: 'Полоса внизу',
          default: 'По умолчанию',
          overlay: 'Полоса поверх содержимого (overlay)',
          top: 'Полоса вверху',
          background: 'Фон карточки'
        },
        bar_size: {
          large: 'Большая',
          medium: 'Средняя',
          small: 'Маленькая',
          xlarge: 'Очень большая'
        },
        layout: {
          horizontal: 'Горизонтальный (по умолчанию)',
          vertical: 'Вертикальный'
        },
        theme: {
          humidity: 'Влажность',
          light: 'Освещение',
          optimal_when_high: 'Оптимально при высоких значениях (Батарея...)',
          optimal_when_low: 'Оптимально при низких значениях (ЦП, ОЗУ,...)',
          pm25: 'PM2.5',
          temperature: 'Температура',
          voc: 'ЛОС'
        },
        bar_color_mode: {
          auto: 'Авто',
          segment: 'Сегменты',
          rainbow: 'Радуга'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Скруглённые углы',
          glass: 'Стекло',
          gradient: 'Градиент',
          gradient_reverse: 'Обратный градиент',
          shimmer: 'Мерцание',
          shimmer_reverse: 'Обратное мерцание'
        },
        hide: {
          icon: 'Иконка',
          name: 'Имя',
          value: 'Значение',
          unit: 'Единица',
          secondary_info: 'Инфо',
          progress_bar: 'Полоса'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  sk: {
    card: {
      msg: {
        appliedDefaultValue: 'Predvolená hodnota bola automaticky použitá.',
        attributeNotFound: 'Atribút sa nenašiel v Home Assistant.',
        entityNotFound: 'Entita sa nenašla v Home Assistant.',
        invalidActionObject: 'Objekt akcie je neplatný alebo nesprávne štruktúrovaný.',
        invalidDecimal: 'Hodnota musí byť kladné celé číslo.',
        invalidEntityId: 'ID entity je neplatné alebo nesprávne.',
        invalidEnumValue: 'Zadaná hodnota nie je súčasťou povolených možností.',
        invalidStateContent: 'Obsah stavu je neplatný alebo nesprávny.',
        invalidStateContentEntry: 'Jedna alebo viac položiek obsahu stavu je neplatných.',
        invalidTheme: 'Zadaná téma je neznáma. Použije sa predvolená téma.',
        invalidTypeArray: 'Očakávala sa hodnota typu pole.',
        invalidTypeBoolean: 'Očakávala sa hodnota typu boolean.',
        invalidTypeNumber: 'Očakávala sa hodnota typu číslo.',
        invalidTypeObject: 'Očakávala sa hodnota typu objekt.',
        invalidTypeString: 'Očakávala sa hodnota typu reťazec.',
        invalidUnionType: 'Hodnota nezodpovedá žiadnemu povolenému typu.',
        missingActionKey: 'Chýba povinný kľúč v objekte akcie.',
        missingRequiredProperty: 'Chýba povinná vlastnosť.'
      }
    },
    editor: {
      title: {
        content: 'Obsah',
        interaction: 'Interakcie',
        theme: 'Vzhľad a použiteľnosť'
      },
      field: {
        attribute: 'Atribút',
        badge_color: 'Farba odznaku',
        badge_icon: 'Ikona odznaku',
        bar_color: 'Farba lišty',
        bar_effect_jinja: 'Efekt lišty (režim Jinja)',
        bar_orientation: 'Orientácia lišty',
        bar_position: 'Pozícia lišty',
        bar_single_line: 'Informácie na jednej línii',
        bar_size: 'Veľkosť lišty',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Farebný režim',
        bar_scale: 'Bar scale',
        center_zero: 'Nula v strede',
        center_zero_value: 'Hodnota stredu',
        center_zero_growth_percent: 'Percento rastu',
        color: 'Farba ikony',
        decimal: 'Desatinné',
        double_tap_action: 'Akcia pri dvojitom ťuknutí',
        entity: 'Entita',
        force_circular_background: 'Vynútiť kruhové pozadie',
        hide_jinja: 'Skryť (režim Jinja)',
        hold_action: 'Akcia pri dlhom podržaní',
        icon: 'Ikona',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Akcia pri dvojitom ťuknutí ikony',
        icon_hold_action: 'Akcia pri dlhom podržaní ikony',
        icon_tap_action: 'Akcia pri ťuknutí ikony',
        layout: 'Rozloženie obsahu',
        max_value: 'Maximálna hodnota',
        min_value: 'Minimálna hodnota',
        name: 'Názov',
        percent: 'Percento',
        reverse_secondary_info_row: 'Vymeňte lištu a text',
        secondary: 'Sekundárna informácia',
        state_content: 'Obsah stavu',
        show_all_actions: 'Zobraziť všetky akcie',
        tap_action: 'Akcia pri ťuknutí',
        text_shadow: 'Pridať tieň textu',
        theme_mode: 'Theme mode',
        theme: 'Téma',
        custom_theme: 'Custom theme zones',
        unit: 'Jednotka',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Vlastné sekundárne info',
        multiline: 'Multiline',
        interpolate: 'Interpolácia farieb',
        name_info: 'Vlastné info názvu',
        reverse: 'Obrátený časovač',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Ďalšie entity',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimálne pri nízkej hodnote (CPU, RAM...)',
          optimal_when_high: 'Optimálne pri vysokej hodnote (Batéria...)',
          light: 'Svetlá',
          temperature: 'Teplota',
          humidity: 'Vlhkosť',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Malá',
          medium: 'Stredná',
          large: 'Veľká',
          xlarge: 'Veľmi veľká'
        },
        bar_orientation: {
          ltr: 'Zľava doprava',
          rtl: 'Sprava doľava',
          up: 'Nahor'
        },
        bar_position: {
          default: 'Predvolené',
          below: 'Pruh pod obsahom',
          top: 'Pruh hore',
          bottom: 'Pruh dole',
          overlay: 'Pruh cez obsah (overlay)',
          background: 'Pozadie karty'
        },
        layout: {
          horizontal: 'Horizontálne (predvolené)',
          vertical: 'Vertikálne'
        },
        bar_color_mode: {
          auto: 'Automaticky',
          segment: 'Segmenty',
          rainbow: 'Dúha'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Zaoblené rohy',
          glass: 'Sklo',
          gradient: 'Prechod',
          gradient_reverse: 'Prechod obrátenou',
          shimmer: 'Trblietanie',
          shimmer_reverse: 'Trblietanie obrátenou'
        },
        hide: {
          icon: 'Ikona',
          name: 'Názov',
          value: 'Hodnota',
          unit: 'Jednotka',
          secondary_info: 'Info',
          progress_bar: 'Lišta'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  sl: {
    card: {
      msg: {
        appliedDefaultValue: 'Privzeta vrednost je bila samodejno uporabljena.',
        attributeNotFound: 'Atribut ni bil najden v Home Assistant.',
        entityNotFound: 'Entiteta ni bila najdena v Home Assistant.',
        invalidActionObject: 'Objekt akcije je neveljaven ali napačno strukturiran.',
        invalidDecimal: 'Vrednost mora biti pozitivno celo število.',
        invalidEntityId: 'ID entitete je neveljaven ali napačen.',
        invalidEnumValue: 'Podana vrednost ni med dovoljenimi možnostmi.',
        invalidStateContent: 'Vsebina stanja je neveljavna ali napačno oblikovana.',
        invalidStateContentEntry: 'Eden ali več vnosov vsebine stanja je neveljavno.',
        invalidTheme: 'Določena tema je neznana. Uporabila se bo privzeta tema.',
        invalidTypeArray: 'Pričakovana je bila vrednost tipa polje.',
        invalidTypeBoolean: 'Pričakovana je bila vrednost tipa boolean.',
        invalidTypeNumber: 'Pričakovana je bila vrednost tipa število.',
        invalidTypeObject: 'Pričakovana je bila vrednost tipa objekt.',
        invalidTypeString: 'Pričakovana je bila vrednost tipa niz.',
        invalidUnionType: 'Vrednost ne ustreza nobeni dovoljeni vrsti.',
        missingActionKey: 'Manjka obvezni ključ v objektu akcije.',
        missingRequiredProperty: 'Manjka obvezna lastnost.'
      }
    },
    editor: {
      title: {
        content: 'Vsebina',
        interaction: 'Interakcije',
        theme: 'Videz in uporabnost'
      },
      field: {
        attribute: 'Atribut',
        badge_color: 'Barva značke',
        badge_icon: 'Ikona značke',
        bar_color: 'Barva vrstice',
        bar_effect_jinja: 'Učinek vrstice (način Jinja)',
        bar_orientation: 'Usmeritev vrstice',
        bar_position: 'Pozicija vrstice',
        bar_single_line: 'Informacije v eni vrstici',
        bar_size: 'Velikost vrstice',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Barvni način',
        bar_scale: 'Bar scale',
        center_zero: 'Ni ničle na sredini',
        center_zero_value: 'Srednja vrednost',
        center_zero_growth_percent: 'Odstotek rasti',
        color: 'Barva ikone',
        decimal: 'Decimalno',
        double_tap_action: 'Akcija ob dvojni tap',
        entity: 'Entiteta',
        force_circular_background: 'Prisili krožno ozadje',
        hide_jinja: 'Skrij (način Jinja)',
        hold_action: 'Akcija ob dolgem pritisku',
        icon: 'Ikona',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Akcija ob dvojni tap ikone',
        icon_hold_action: 'Akcija ob dolgem pritisku ikone',
        icon_tap_action: 'Akcija ob tap ikone',
        layout: 'Postavitev vsebine',
        max_value: 'Največja vrednost',
        min_value: 'Najmanjša vrednost',
        name: 'Ime',
        percent: 'Odstotek',
        reverse_secondary_info_row: 'Zamenjaj vrstico in besedilo',
        secondary: 'Sekundarne informacije',
        state_content: 'Vsebina stanja',
        show_all_actions: 'Prikaži vsa dejanja',
        tap_action: 'Akcija ob tap',
        text_shadow: 'Dodaj senco besedila',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Custom theme zones',
        unit: 'Enota',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Prilagojena sekundarna informacija',
        multiline: 'Multiline',
        interpolate: 'Interpolacija barv',
        name_info: 'Prilagojena informacija o imenu',
        reverse: 'Obrnjen časovnik',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Dodatni entiteti',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: 'Optimalno pri nizkih vrednostih (CPU, RAM...)',
          optimal_when_high: 'Optimalno pri visokih vrednostih (Baterija...)',
          light: 'Svetla',
          temperature: 'Temperatura',
          humidity: 'Vlažnost',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: 'Majhna',
          medium: 'Srednja',
          large: 'Velika',
          xlarge: 'Zelo velika'
        },
        bar_orientation: {
          ltr: 'Levo proti desni',
          rtl: 'Desno proti levi',
          up: 'Navzgor'
        },
        bar_position: {
          default: 'Privzeto',
          below: 'Vrstica pod vsebino',
          top: 'Vrstica zgoraj',
          bottom: 'Vrstica spodaj',
          overlay: 'Vrstica čez vsebino (overlay)',
          background: 'Ozadje kartice'
        },
        layout: {
          horizontal: 'Horizontalno (privzeto)',
          vertical: 'Vertikalno'
        },
        bar_color_mode: {
          auto: 'Samodejno',
          segment: 'Segmenti',
          rainbow: 'Mavrica'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Zaobljeni robovi',
          glass: 'Steklo',
          gradient: 'Prehod',
          gradient_reverse: 'Obrnjen prehod',
          shimmer: 'Blesk',
          shimmer_reverse: 'Obrnjen blesk'
        },
        hide: {
          icon: 'Ikona',
          name: 'Ime',
          value: 'Vrednost',
          unit: 'Enota',
          secondary_info: 'Info',
          progress_bar: 'Vrstica'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  sv: {
    card: {
      msg: {
        appliedDefaultValue: 'Ett standardvärde har tillämpats automatiskt.',
        attributeNotFound: 'Attributet kunde inte hittas i Home Assistant.',
        entityNotFound: 'Enheten kunde inte hittas i Home Assistant.',
        invalidActionObject: 'Åtgärdsobjektet är ogiltigt eller felstrukturerat.',
        invalidDecimal: 'Värdet måste vara ett giltigt decimaltal.',
        invalidEntityId: 'Enhets-ID är ogiltigt eller felaktigt formaterat.',
        invalidEnumValue: 'Det angivna värdet är inte ett giltigt alternativ.',
        invalidStateContent: 'Tillståndsinnehållet är ogiltigt eller felaktigt.',
        invalidStateContentEntry: 'En eller flera poster i tillståndsinnehållet är ogiltiga.',
        invalidTheme: 'Det angivna temat är okänt. Standardtema används.',
        invalidTypeArray: 'Förväntade ett värde av typen array.',
        invalidTypeBoolean: 'Förväntade ett värde av typen boolean.',
        invalidTypeNumber: 'Förväntade ett värde av typen nummer.',
        invalidTypeObject: 'Förväntade ett värde av typen objekt.',
        invalidTypeString: 'Förväntade ett värde av typen sträng.',
        invalidUnionType: 'Värdet matchar inte något av de tillåtna typerna.',
        missingActionKey: 'En obligatorisk nyckel saknas i åtgärdsobjektet.',
        missingRequiredProperty: 'En obligatorisk egenskap saknas.'
      }
    },
    editor: {
      title: {
        content: 'Innehåll',
        interaction: 'Interaktioner',
        theme: 'Utseende och funktionalitet'
      },
      field: {
        attribute: 'Attribut',
        badge_color: 'Färg på bricka',
        badge_icon: 'Ikon för bricka',
        bar_color: 'Färg för baren',
        bar_effect_jinja: 'Effekt på baren (Jinja-läge)',
        bar_orientation: 'Orientering av baren',
        bar_position: 'Position för baren',
        bar_single_line: 'Info på en rad',
        bar_size: 'Barstorlek',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Färgläge',
        bar_scale: 'Bar scale',
        center_zero: 'Noll i mitten',
        center_zero_value: 'Centervärde',
        center_zero_growth_percent: 'Tillväxtprocent',
        color: 'Primärfärg',
        decimal: 'decimal',
        double_tap_action: 'Åtgärd vid dubbeltryck',
        entity: 'Enhet',
        force_circular_background: 'Tvinga cirkulär bakgrund',
        hide_jinja: 'Dölj (Jinja-läge)',
        hold_action: 'Åtgärd vid långt tryck',
        icon: 'Ikon',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Åtgärd vid dubbeltryck på ikonen',
        icon_hold_action: 'Åtgärd vid långt tryck på ikonen',
        icon_tap_action: 'Åtgärd vid tryck på ikonen',
        layout: 'Innehållslayout',
        max_value: 'Maximalt värde',
        min_value: 'Minsta värde',
        name: 'Namn',
        percent: 'Procent',
        reverse_secondary_info_row: 'Byt ut stapel och text',
        secondary: 'Sekundär information',
        state_content: 'Statusinnehåll',
        show_all_actions: 'Visa alla åtgärder',
        tap_action: 'Åtgärd vid kort tryck',
        text_shadow: 'Lägg till textskugga',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Custom theme zones',
        unit: 'Enhet',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Anpassad sekundär info',
        multiline: 'Multiline',
        interpolate: 'Interpolera färger',
        name_info: 'Anpassad namninfo',
        reverse: 'Omvänd timer',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Ytterligare entiteter',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'Vänster till höger',
          rtl: 'Höger till vänster',
          up: 'Uppåt'
        },
        bar_position: {
          below: 'Bar under innehållet',
          bottom: 'Bar längst ned',
          default: 'Standard',
          overlay: 'Bar överlagrad på innehållet (overlay)',
          top: 'Bar längst upp',
          background: 'Kortbakgrund'
        },
        bar_size: {
          large: 'Stor',
          medium: 'Medium',
          small: 'Liten',
          xlarge: 'Extra stor'
        },
        layout: {
          horizontal: 'Horisontell (standard)',
          vertical: 'Vertikal'
        },
        theme: {
          humidity: 'Luftfuktighet',
          light: 'Ljus',
          optimal_when_high: 'Optimal när det är högt (Batteri...)',
          optimal_when_low: 'Optimal när det är lågt (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'Temperatur',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Auto',
          segment: 'Segment',
          rainbow: 'Regnbåge'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Rundade hörn',
          glass: 'Glas',
          gradient: 'Gradient',
          gradient_reverse: 'Omvänd gradient',
          shimmer: 'Glans',
          shimmer_reverse: 'Omvänd glans'
        },
        hide: {
          icon: 'Ikon',
          name: 'Namn',
          value: 'Värde',
          unit: 'Enhet',
          secondary_info: 'Info',
          progress_bar: 'Stapel'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  th: {
    card: {
      msg: {
        appliedDefaultValue: 'ค่าเริ่มต้นถูกนำไปใช้โดยอัตโนมัติ',
        attributeNotFound: 'ไม่พบแอตทริบิวต์ใน HA',
        entityNotFound: 'ไม่พบเอนทิตีใน HA',
        invalidActionObject: 'ออบเจ็กต์แอ็กชันไม่ถูกต้องหรือโครงสร้างผิด',
        invalidDecimal: 'ค่าต้องเป็นตัวเลขทศนิยมที่ถูกต้อง',
        invalidEntityId: 'ID เอนทิตีไม่ถูกต้องหรือรูปแบบผิด',
        invalidEnumValue: 'ค่าที่ให้มาไม่ใช่หนึ่งในตัวเลือกที่อนุญาต',
        invalidStateContent: 'เนื้อหาสถานะไม่ถูกต้องหรือรูปแบบผิด',
        invalidStateContentEntry: 'หนึ่งหรือหลายรายการในเนื้อหาสถานะไม่ถูกต้อง',
        invalidTheme: 'ธีมที่ระบุไม่รู้จัก จะใช้ธีมเริ่มต้น',
        invalidTypeArray: 'คาดหวังค่าประเภทอาร์เรย์',
        invalidTypeBoolean: 'คาดหวังค่าประเภทบูลีน',
        invalidTypeNumber: 'คาดหวังค่าประเภทตัวเลข',
        invalidTypeObject: 'คาดหวังค่าประเภทออบเจ็กต์',
        invalidTypeString: 'คาดหวังค่าประเภทสตริง',
        invalidUnionType: 'ค่าไม่ตรงกับประเภทที่อนุญาตใด ๆ',
        missingActionKey: 'ขาดคีย์ที่จำเป็นในออบเจ็กต์แอ็กชัน',
        missingRequiredProperty: 'ขาดคุณสมบัติที่จำเป็น'
      }
    },
    editor: {
      title: {
        content: 'เนื้อหา',
        interaction: 'การโต้ตอบ',
        theme: 'รูปลักษณ์และความรู้สึก'
      },
      field: {
        attribute: 'แอตทริบิวต์',
        badge_color: 'สีของป้าย',
        badge_icon: 'ไอคอนของป้าย',
        bar_color: 'สีแถบ',
        bar_effect_jinja: 'เอฟเฟกต์บนแถบ (โหมด Jinja)',
        bar_orientation: 'การวางแนวแถบ',
        bar_position: 'ตำแหน่งแถบ',
        bar_single_line: 'ข้อมูลในบรรทัดเดียว',
        bar_size: 'ขนาดแถบ',
        bar_segments: 'Bar segments',
        bar_color_mode: 'โหมดสี',
        bar_scale: 'Bar scale',
        center_zero: 'Sıfırı ortala',
        center_zero_value: 'ค่ากึ่งกลาง',
        center_zero_growth_percent: 'เปอร์เซ็นต์การเติบโต',
        color: 'สีหลัก',
        decimal: 'ทศนิยม',
        double_tap_action: 'พฤติกรรมการแตะสองครั้ง',
        entity: 'เอนทิตี',
        force_circular_background: 'บังคับพื้นหลังวงกลม',
        hide_jinja: 'ซ่อน (โหมด Jinja)',
        hold_action: 'พฤติกรรมการกด',
        icon: 'ไอคอน',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'พฤติกรรมการแตะไอคอนสองครั้ง',
        icon_hold_action: 'พฤติกรรมการกดไอคอน',
        icon_tap_action: 'พฤติกรรมการแตะไอคอน',
        layout: 'รูปแบบเนื้อหา',
        max_value: 'ค่าสูงสุด',
        min_value: 'ค่าต่ำสุด',
        name: 'ชื่อ',
        percent: 'เปอร์เซ็นต์',
        reverse_secondary_info_row: 'แถบและข้อความสลับกัน',
        secondary: 'ข้อมูลรอง',
        state_content: 'เนื้อหาของสถานะ',
        show_all_actions: 'แสดงการโต้ตอบทั้งหมด',
        tap_action: 'พฤติกรรมการแตะ',
        text_shadow: 'เพิ่มเงาให้ข้อความ',
        theme_mode: 'Theme mode',
        theme: 'ธีม',
        custom_theme: 'Custom theme zones',
        unit: 'หน่วย',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'ข้อมูลรองที่กำหนดเอง',
        multiline: 'Multiline',
        interpolate: 'การสอดแทรกสี',
        name_info: 'ข้อมูลชื่อที่กำหนดเอง',
        reverse: 'กลับเวลานับถอยหลัง',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'เอนทิตีเพิ่มเติม',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'ซ้ายไปขวา',
          rtl: 'ขวาไปซ้าย',
          up: 'ขึ้นบน'
        },
        bar_position: {
          below: 'แถบใต้เนื้อหา',
          bottom: 'แถบด้านล่าง',
          default: 'ค่าเริ่มต้น',
          overlay: 'แถบซ้อนทับเนื้อหา (overlay)',
          top: 'แถบด้านบน',
          background: 'พื้นหลังการ์ด'
        },
        bar_size: {
          large: 'ใหญ่',
          medium: 'กลาง',
          small: 'เล็ก',
          xlarge: 'ใหญ่พิเศษ'
        },
        layout: {
          horizontal: 'แนวนอน (เริ่มต้น)',
          vertical: 'แนวตั้ง'
        },
        theme: {
          humidity: 'ความชื้น',
          light: 'แสง',
          optimal_when_high: 'เหมาะสมเมื่อสูง (แบตเตอรี่...)',
          optimal_when_low: 'เหมาะสมเมื่อต่ำ (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'อุณหภูมิ',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'อัตโนมัติ',
          segment: 'ส่วน',
          rainbow: 'สีรุ้ง'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'มุมโค้งมน',
          glass: 'กระจก',
          gradient: 'ไล่สี',
          gradient_reverse: 'ไล่สีย้อน',
          shimmer: 'แวววาว',
          shimmer_reverse: 'แวววาวย้อน'
        },
        hide: {
          icon: 'ไอคอน',
          name: 'ชื่อ',
          value: 'ค่า',
          unit: 'หน่วย',
          secondary_info: 'ข้อมูล',
          progress_bar: 'แถบ'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  tr: {
    card: {
      msg: {
        appliedDefaultValue: 'Varsayılan değer otomatik olarak uygulandı.',
        attributeNotFound: 'Öznitelik Home Assistant\'ta bulunamadı.',
        entityNotFound: 'Varlık Home Assistant\'ta bulunamadı.',
        invalidActionObject: 'Eylem nesnesi geçersiz veya hatalı yapılandırılmış.',
        invalidDecimal: 'Değer geçerli bir ondalık sayı olmalıdır.',
        invalidEntityId: 'Varlık kimliği geçersiz veya hatalı biçimlendirilmiş.',
        invalidEnumValue: 'Sağlanan değer izin verilen seçeneklerden biri değil.',
        invalidStateContent: 'Durum içeriği geçersiz veya hatalı biçimlendirilmiş.',
        invalidStateContentEntry: 'Durum içeriğindeki bir veya daha fazla giriş geçersiz.',
        invalidTheme: 'Belirtilen tema bilinmiyor. Varsayılan tema kullanılacak.',
        invalidTypeArray: 'Dizi türünde bir değer bekleniyordu.',
        invalidTypeBoolean: 'Boolean türünde bir değer bekleniyordu.',
        invalidTypeNumber: 'Sayı türünde bir değer bekleniyordu.',
        invalidTypeObject: 'Nesne türünde bir değer bekleniyordu.',
        invalidTypeString: 'Dize (string) türünde bir değer bekleniyordu.',
        invalidUnionType: 'Değer izin verilen türlerden hiçbirine uymuyor.',
        missingActionKey: 'Eylem nesnesinde gerekli bir anahtar eksik.',
        missingRequiredProperty: 'Gerekli bir özellik eksik.'
      }
    },
    editor: {
      title: {
        content: 'İçerik',
        interaction: 'Etkileşimler',
        theme: 'Görünüm'
      },
      field: {
        attribute: 'Öznitelik',
        badge_color: 'Rozet rengi',
        badge_icon: 'Rozet simgesi',
        bar_color: 'Çubuk rengi',
        bar_effect_jinja: 'Çubuk efekti (Jinja modu)',
        bar_orientation: 'Çubuk yönü',
        bar_position: 'Çubuk konumu',
        bar_single_line: 'Bilgiyi tek satırda göster',
        bar_size: 'Çubuk boyutu',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Renk modu',
        bar_scale: 'Bar scale',
        center_zero: 'Нуль по центру',
        center_zero_value: 'Merkez değeri',
        center_zero_growth_percent: 'Büyüme yüzdesi',
        color: 'Birincil renk',
        decimal: 'ondalık',
        double_tap_action: 'Çift dokunma davranışı',
        entity: 'Varlık',
        force_circular_background: 'Dairesel arka planı zorla',
        hide_jinja: 'Gizle (Jinja modu)',
        hold_action: 'Uzun basma davranışı',
        icon: 'Simge',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Simgeye çift dokunma davranışı',
        icon_hold_action: 'Simgeye uzun basma davranışı',
        icon_tap_action: 'Simgeye dokunma davranışı',
        layout: 'İçerik düzeni',
        max_value: 'Maksimum değer',
        min_value: 'Minimum değer',
        name: 'Ad',
        percent: 'Yüzde',
        reverse_secondary_info_row: 'Çubuğu ve metni değiştir',
        secondary: 'İkincil bilgi',
        state_content: 'Durum içeriği',
        show_all_actions: 'Tüm eylemleri göster',
        tap_action: 'Kısa dokunma davranışı',
        text_shadow: 'Metne gölge ekle',
        theme_mode: 'Theme mode',
        theme: 'Tema',
        custom_theme: 'Custom theme zones',
        unit: 'Birim',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Özel ikincil bilgi',
        multiline: 'Multiline',
        interpolate: 'Renk interpolasyonu',
        name_info: 'Özel ad bilgisi',
        reverse: 'Zamanlayıcıyı tersine çevir',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Ek varlıklar',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'Soldan sağa',
          rtl: 'Sağdan sola',
          up: 'Yukarı'
        },
        bar_position: {
          below: 'İçeriğin altında çubuk',
          bottom: 'Altta çubuk',
          default: 'Varsayılan',
          overlay: 'İçeriğin üzerine bindirme (overlay)',
          top: 'Üstte çubuk',
          background: 'Kart arka planı'
        },
        bar_size: {
          large: 'Büyük',
          medium: 'Orta',
          small: 'Küçük',
          xlarge: 'Çok büyük'
        },
        layout: {
          horizontal: 'Yatay (varsayılan)',
          vertical: 'Dikey'
        },
        theme: {
          humidity: 'Nem',
          light: 'Işık',
          optimal_when_high: 'Yüksekken en iyi (Pil...)',
          optimal_when_low: 'Düşükken en iyi (CPU, RAM...)',
          pm25: 'PM2.5',
          temperature: 'Sıcaklık',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Otomatik',
          segment: 'Bölümler',
          rainbow: 'Gökkuşağı'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Yuvarlatılmış köşeler',
          glass: 'Cam',
          gradient: 'Gradyan',
          gradient_reverse: 'Ters gradyan',
          shimmer: 'Parıltı',
          shimmer_reverse: 'Ters parıltı'
        },
        hide: {
          icon: 'Simge',
          name: 'Ad',
          value: 'Değer',
          unit: 'Birim',
          secondary_info: 'Bilgi',
          progress_bar: 'Çubuk'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  uk: {
    card: {
      msg: {
        appliedDefaultValue: 'Значення за замовчуванням було застосовано автоматично.',
        attributeNotFound: 'Атрибут не знайдено в HA.',
        entityNotFound: 'Сутність не знайдена в HA.',
        invalidActionObject: 'Об\'єкт дії недійсний або неправильно структурований.',
        invalidDecimal: 'Значення повинно бути дійсним десятковим числом.',
        invalidEntityId: 'ID сутності недійсний або неправильно сформований.',
        invalidEnumValue: 'Надане значення не є одним з дозволених варіантів.',
        invalidStateContent: 'Вміст стану недійсний або неправильно сформований.',
        invalidStateContentEntry: 'Один або кілька записів у вмісті стану недійсні.',
        invalidTheme: 'Зазначена тема невідома. Буде використана тема за замовчуванням.',
        invalidTypeArray: 'Очікується значення типу масив.',
        invalidTypeBoolean: 'Очікується значення типу булевий.',
        invalidTypeNumber: 'Очікується значення типу число.',
        invalidTypeObject: 'Очікується значення типу об\'єкт.',
        invalidTypeString: 'Очікується значення типу рядок.',
        invalidUnionType: 'Значення не відповідає жодному з дозволених типів.',
        missingActionKey: 'Відсутній обов\'язковий ключ в об\'єкті дії.',
        missingRequiredProperty: 'Відсутня обов\'язкова властивість.'
      }
    },
    editor: {
      title: {
        content: 'Вміст',
        interaction: 'Взаємодії',
        theme: 'Вигляд та відчуття'
      },
      field: {
        attribute: 'Атрибут',
        badge_color: 'Колір значка',
        badge_icon: 'Іконка значка',
        bar_color: 'Колір панелі',
        bar_effect_jinja: 'Ефект на панелі (режим Jinja)',
        bar_orientation: 'Орієнтація панелі',
        bar_position: 'Положення панелі',
        bar_single_line: 'Інформація в один рядок',
        bar_size: 'Розмір панелі',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Режим кольору',
        bar_scale: 'Bar scale',
        center_zero: 'Không ở giữa',
        center_zero_value: 'Центральне значення',
        center_zero_growth_percent: 'Відсоток зростання',
        color: 'Основний колір',
        decimal: 'десятковий',
        double_tap_action: 'Поведінка при подвійному дотику',
        entity: 'Сутність',
        force_circular_background: 'Примусовий круглий фон',
        hide_jinja: 'Приховати (режим Jinja)',
        hold_action: 'Поведінка при утриманні',
        icon: 'Іконка',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Поведінка подвійного дотику іконки',
        icon_hold_action: 'Поведінка утримання іконки',
        icon_tap_action: 'Поведінка дотику іконки',
        layout: 'Розташування вмісту',
        max_value: 'Максимальне значення',
        min_value: 'Мінімальне значення',
        name: 'Назва',
        percent: 'Відсоток',
        reverse_secondary_info_row: 'Поміняти місцями панель і текст',
        secondary: 'Додаткова інформація',
        state_content: 'Вміст стану',
        show_all_actions: 'Показати всі дії',
        tap_action: 'Поведінка при дотику',
        text_shadow: 'Додати тінь до тексту',
        theme_mode: 'Theme mode',
        theme: 'Тема',
        custom_theme: 'Custom theme zones',
        unit: 'Одиниця',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Додаткова вторинна інформація',
        multiline: 'Multiline',
        interpolate: 'Інтерполяція кольорів',
        name_info: 'Додаткова інформація (назва)',
        reverse: 'Зворотній таймер',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Додаткові об\'єкти',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'Зліва направо',
          rtl: 'Справа наліво',
          up: 'Вгору'
        },
        bar_position: {
          below: 'Панель під вмістом',
          bottom: 'Панель знизу',
          default: 'За замовчуванням',
          overlay: 'Панель поверх вмісту (overlay)',
          top: 'Панель зверху',
          background: 'Фон картки'
        },
        bar_size: {
          large: 'Велика',
          medium: 'Середня',
          small: 'Мала',
          xlarge: 'Дуже велика'
        },
        layout: {
          horizontal: 'Горизонтальний (за замовчуванням)',
          vertical: 'Вертикальний'
        },
        theme: {
          humidity: 'Вологість',
          light: 'Світло',
          optimal_when_high: 'Оптимально при високих значеннях (Батарея...)',
          optimal_when_low: 'Оптимально при низьких значеннях (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'Температура',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Авто',
          segment: 'Сегменти',
          rainbow: 'Веселка'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Заокруглені кути',
          glass: 'Скло',
          gradient: 'Градієнт',
          gradient_reverse: 'Зворотній градієнт',
          shimmer: 'Мерехтіння',
          shimmer_reverse: 'Зворотнє мерехтіння'
        },
        hide: {
          icon: 'Іконка',
          name: 'Ім\'я',
          value: 'Значення',
          unit: 'Одиниця',
          secondary_info: 'Інфо',
          progress_bar: 'Смуга'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  vi: {
    card: {
      msg: {
        appliedDefaultValue: 'Một giá trị mặc định đã được áp dụng tự động.',
        attributeNotFound: 'Không tìm thấy thuộc tính trong HA.',
        entityNotFound: 'Không tìm thấy thực thể trong HA.',
        invalidActionObject: 'Đối tượng hành động không hợp lệ hoặc cấu trúc không đúng.',
        invalidDecimal: 'Giá trị phải là một số thập phân hợp lệ.',
        invalidEntityId: 'ID thực thể không hợp lệ hoặc không đúng định dạng.',
        invalidEnumValue: 'Giá trị được cung cấp không nằm trong các tùy chọn được phép.',
        invalidStateContent: 'Nội dung trạng thái không hợp lệ hoặc không đúng định dạng.',
        invalidStateContentEntry: 'Một hoặc nhiều mục trong nội dung trạng thái không hợp lệ.',
        invalidTheme: 'Chủ đề được chỉ định không xác định. Chủ đề mặc định sẽ được sử dụng.',
        invalidTypeArray: 'Mong đợi một giá trị kiểu mảng.',
        invalidTypeBoolean: 'Mong đợi một giá trị kiểu boolean.',
        invalidTypeNumber: 'Mong đợi một giá trị kiểu số.',
        invalidTypeObject: 'Mong đợi một giá trị kiểu đối tượng.',
        invalidTypeString: 'Mong đợi một giá trị kiểu chuỗi.',
        invalidUnionType: 'Giá trị không khớp với bất kỳ loại nào được phép.',
        missingActionKey: 'Một khóa bắt buộc bị thiếu trong đối tượng hành động.',
        missingRequiredProperty: 'Thuộc tính bắt buộc bị thiếu.'
      }
    },
    editor: {
      title: {
        content: 'Nội dung',
        interaction: 'Tương tác',
        theme: 'Giao diện & Trải nghiệm'
      },
      field: {
        attribute: 'Thuộc tính',
        badge_color: 'Màu huy hiệu',
        badge_icon: 'Biểu tượng huy hiệu',
        bar_color: 'Màu thanh',
        bar_effect_jinja: 'Hiệu ứng thanh (chế độ Jinja)',
        bar_orientation: 'Hướng thanh',
        bar_position: 'Vị trí thanh',
        bar_single_line: 'Thông tin trên một dòng',
        bar_size: 'Kích thước thanh',
        bar_segments: 'Bar segments',
        bar_color_mode: 'Chế độ màu',
        bar_scale: 'Bar scale',
        center_zero: '零点居中',
        center_zero_value: 'Giá trị tâm',
        center_zero_growth_percent: 'Tỷ lệ tăng trưởng',
        color: 'Màu chính',
        decimal: 'thập phân',
        double_tap_action: 'Hành vi chạm đôi',
        entity: 'Thực thể',
        force_circular_background: 'Buộc nền hình tròn',
        hide_jinja: 'Ẩn (chế độ Jinja)',
        hold_action: 'Hành vi giữ',
        icon: 'Biểu tượng',
        icon_animation: 'Icon animation',
        icon_double_tap_action: 'Hành vi chạm đôi biểu tượng',
        icon_hold_action: 'Hành vi giữ biểu tượng',
        icon_tap_action: 'Hành vi chạm biểu tượng',
        layout: 'Bố cục nội dung',
        max_value: 'Giá trị tối đa',
        min_value: 'Giá trị tối thiểu',
        name: 'Tên',
        percent: 'Phần trăm',
        reverse_secondary_info_row: 'Hoán đổi thanh và văn bản',
        secondary: 'Thông tin phụ',
        state_content: 'Nội dung trạng thái',
        show_all_actions: 'Hiển thị tất cả hành động',
        tap_action: 'Hành vi chạm',
        text_shadow: 'Thêm bóng cho văn bản',
        theme_mode: 'Theme mode',
        theme: 'Chủ đề',
        custom_theme: 'Custom theme zones',
        unit: 'Đơn vị',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: 'Thông tin phụ tùy chỉnh',
        multiline: 'Multiline',
        interpolate: 'Nội suy màu sắc',
        name_info: 'Thông tin tên tùy chỉnh',
        reverse: 'Đảo ngược bộ đếm thời gian',
        bar_stack_mode: 'Stack mode',
        bar_stack: 'Thực thể bổ sung',
        migrate_config: 'Migrate config'
      },
      option: {
        bar_orientation: {
          ltr: 'Trái sang phải',
          rtl: 'Phải sang trái',
          up: 'Hướng lên'
        },
        bar_position: {
          below: 'Thanh bên dưới nội dung',
          bottom: 'Thanh ở dưới cùng',
          default: 'Mặc định',
          overlay: 'Thanh phủ lên nội dung (overlay)',
          top: 'Thanh ở trên cùng',
          background: 'Nền thẻ'
        },
        bar_size: {
          large: 'Lớn',
          medium: 'Trung bình',
          small: 'Nhỏ',
          xlarge: 'Rất lớn'
        },
        layout: {
          horizontal: 'Ngang (mặc định)',
          vertical: 'Dọc'
        },
        theme: {
          humidity: 'Độ ẩm',
          light: 'Ánh sáng',
          optimal_when_high: 'Tối ưu khi cao (Pin...)',
          optimal_when_low: 'Tối ưu khi thấp (CPU, RAM,...)',
          pm25: 'PM2.5',
          temperature: 'Nhiệt độ',
          voc: 'VOC'
        },
        bar_color_mode: {
          auto: 'Tự động',
          segment: 'Phân đoạn',
          rainbow: 'Cầu vồng'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: 'Góc bo tròn',
          glass: 'Kính',
          gradient: 'Dốc màu',
          gradient_reverse: 'Dốc màu ngược',
          shimmer: 'Lấp lánh',
          shimmer_reverse: 'Lấp lánh ngược'
        },
        hide: {
          icon: 'Biểu tượng',
          name: 'Tên',
          value: 'Giá trị',
          unit: 'Đơn vị',
          secondary_info: 'Thông tin',
          progress_bar: 'Thanh'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  'zh-Hans': {
    card: {
      msg: {
        appliedDefaultValue: '默认值已自动应用。',
        attributeNotFound: '在 Home Assistant 中未找到属性。',
        entityNotFound: '在 Home Assistant 中未找到实体。',
        invalidActionObject: '操作对象无效或结构错误。',
        invalidDecimal: '值必须为有效的小数。',
        invalidEntityId: '实体 ID 无效或格式错误。',
        invalidEnumValue: '提供的值不在允许选项内。',
        invalidStateContent: '状态内容无效或格式错误。',
        invalidStateContentEntry: '状态内容中的一项或多项无效。',
        invalidTheme: '指定的主题未知，将使用默认主题。',
        invalidTypeArray: '应为数组类型的值。',
        invalidTypeBoolean: '应为布尔类型的值。',
        invalidTypeNumber: '应为数字类型的值。',
        invalidTypeObject: '应为对象类型的值。',
        invalidTypeString: '应为字符串类型的值。',
        invalidUnionType: '值不符合任何允许类型。',
        missingActionKey: '操作对象缺少必需的键。',
        missingRequiredProperty: '缺少必需的属性。'
      }
    },
    editor: {
      title: {
        content: '内容',
        interaction: '交互',
        theme: '外观与体验'
      },
      field: {
        attribute: '属性',
        badge_color: '徽章颜色',
        badge_icon: '徽章图标',
        bar_color: '进度条颜色',
        bar_effect_jinja: '进度条效果 (Jinja 模式)',
        bar_orientation: '进度条方向',
        bar_position: '进度条位置',
        bar_single_line: '单行信息',
        bar_size: '进度条大小',
        bar_segments: 'Bar segments',
        bar_color_mode: '颜色模式',
        bar_scale: 'Bar scale',
        center_zero: '中心為零',
        center_zero_value: '中心值',
        center_zero_growth_percent: '增长百分比',
        color: '主色',
        decimal: '小数',
        double_tap_action: '双击动作',
        entity: '实体',
        force_circular_background: '强制圆形背景',
        hide_jinja: '隐藏 (Jinja 模式)',
        hold_action: '长按动作',
        icon: '图标',
        icon_animation: 'Icon animation',
        icon_double_tap_action: '图标双击动作',
        icon_hold_action: '图标长按动作',
        icon_tap_action: '图标点击动作',
        layout: '内容布局',
        max_value: '最大值',
        min_value: '最小值',
        name: '名称',
        percent: '百分比',
        reverse_secondary_info_row: '交换进度条和文本',
        secondary: '次要信息',
        state_content: '状态内容',
        show_all_actions: '显示所有交互',
        tap_action: '点击动作',
        text_shadow: '添加文本阴影',
        theme_mode: 'Theme mode',
        theme: '主题',
        custom_theme: 'Custom theme zones',
        unit: '单位',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: '自定义次要信息',
        multiline: 'Multiline',
        interpolate: '颜色插值',
        name_info: '自定义名称信息',
        reverse: '反转计时器',
        bar_stack_mode: 'Stack mode',
        bar_stack: '附加实体',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: '值低时最佳（CPU、内存等）',
          optimal_when_high: '值高时最佳（电池等）',
          light: '亮度',
          temperature: '温度',
          humidity: '湿度',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: '小',
          medium: '中',
          large: '大',
          xlarge: '超大'
        },
        bar_orientation: {
          ltr: '从左到右',
          rtl: '从右到左',
          up: '向上'
        },
        bar_position: {
          default: '默认',
          below: '内容下方的进度条',
          top: '顶部进度条',
          bottom: '底部进度条',
          overlay: '覆盖内容的进度条',
          background: '卡片背景'
        },
        layout: {
          horizontal: '水平（默认）',
          vertical: '垂直'
        },
        bar_color_mode: {
          auto: '自动',
          segment: '分段',
          rainbow: '彩虹'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: '圆角',
          glass: '玻璃',
          gradient: '渐变',
          gradient_reverse: '反向渐变',
          shimmer: '微光',
          shimmer_reverse: '反向微光'
        },
        hide: {
          icon: '图标',
          name: '名称',
          value: '数值',
          unit: '单位',
          secondary_info: '补充信息',
          progress_bar: '进度条'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  },
  'zh-Hant': {
    card: {
      msg: {
        appliedDefaultValue: '已自動套用預設值。',
        attributeNotFound: '在 Home Assistant 中找不到此屬性。',
        entityNotFound: '在 Home Assistant 中找不到此實體。',
        invalidActionObject: '動作物件無效或結構不正確。',
        invalidDecimal: '數值必須是正整數。',
        invalidEntityId: '實體 ID 無效或格式不正確。',
        invalidEnumValue: '提供的值不在允許的選項中。',
        invalidStateContent: '狀態內容無效或格式不正確。',
        invalidStateContentEntry: '一個或多個狀態內容項目無效。',
        invalidTheme: '指定的主題未知，將使用預設主題。',
        invalidTypeArray: '預期為陣列類型的值。',
        invalidTypeBoolean: '預期為布林值類型的值。',
        invalidTypeNumber: '預期為數字類型的值。',
        invalidTypeObject: '預期為物件類型的值。',
        invalidTypeString: '預期為字串類型的值。',
        invalidUnionType: '值不符合任何允許的類型。',
        missingActionKey: '動作物件中缺少必要鍵。',
        missingRequiredProperty: '缺少必要屬性。'
      }
    },
    editor: {
      title: {
        content: '內容',
        interaction: '互動',
        theme: '外觀與主題'
      },
      field: {
        attribute: '屬性',
        badge_color: '徽章顏色',
        badge_icon: '徽章圖示',
        bar_color: '進度條顏色',
        bar_effect_jinja: '進度條效果 (Jinja 模式)',
        bar_orientation: '進度條方向',
        bar_position: '進度條位置',
        bar_single_line: '單行資訊',
        bar_size: '進度條大小',
        bar_segments: 'Bar segments',
        bar_color_mode: '顏色模式',
        bar_scale: 'Bar scale',
        center_zero: '中心為零',
        center_zero_value: '中心值',
        center_zero_growth_percent: '增長百分比',
        color: '圖示顏色',
        decimal: '小數',
        double_tap_action: '雙擊操作',
        entity: '實體',
        force_circular_background: '強制圓形背景',
        hide_jinja: '隱藏 (Jinja 模式)',
        hold_action: '長按操作',
        icon: '圖示',
        icon_animation: 'Icon animation',
        icon_double_tap_action: '圖示雙擊操作',
        icon_hold_action: '圖示長按操作',
        icon_tap_action: '圖示點擊操作',
        layout: '內容佈局',
        max_value: '最大值',
        min_value: '最小值',
        name: '名稱',
        percent: '百分比',
        reverse_secondary_info_row: '交換進度條和文字',
        secondary: '次要資訊',
        state_content: '狀態內容',
        show_all_actions: '顯示所有互動',
        tap_action: '點擊操作',
        text_shadow: '文字陰影',
        theme_mode: 'Theme mode',
        theme: '主題',
        custom_theme: 'Custom theme zones',
        unit: '單位',
        min_value_mode: 'Min value source',
        max_value_mode: 'Max value source',
        watermark_low_mode: 'Low watermark source',
        watermark_high_mode: 'High watermark source',
        bar_max_width: 'Bar max width',
        bar_max_width_toggle: 'Bar max width',
        frameless: 'Frameless',
        height: 'Height',
        marginless: 'Marginless',
        min_width: 'Min width',
        unit_spacing: 'Unit spacing',
        watermark_toggle: 'Watermark',
        alert_toggle: 'Alert',
        custom_info: '自訂次要資訊',
        multiline: 'Multiline',
        interpolate: '顏色插值',
        name_info: '自訂名稱資訊',
        reverse: '反轉計時器',
        bar_stack_mode: 'Stack mode',
        bar_stack: '附加實體',
        migrate_config: 'Migrate config'
      },
      option: {
        theme: {
          optimal_when_low: '數值低時最佳（CPU, RAM…）',
          optimal_when_high: '數值高時最佳（電池…）',
          light: '明亮',
          temperature: '溫度',
          humidity: '濕度',
          pm25: 'PM2.5',
          voc: 'VOC'
        },
        bar_size: {
          small: '小',
          medium: '中',
          large: '大',
          xlarge: '特大'
        },
        bar_orientation: {
          ltr: '由左到右',
          rtl: '由右到左',
          up: '向上'
        },
        bar_position: {
          default: '預設',
          below: '內容下方',
          top: '上方',
          bottom: '下方',
          overlay: '疊加在內容上',
          background: '卡片背景'
        },
        layout: {
          horizontal: '水平（預設）',
          vertical: '垂直'
        },
        bar_color_mode: {
          auto: '自動',
          segment: '分段',
          rainbow: '彩虹'
        },
        bar_scale: {
          linear: 'Linear',
          log: 'Logarithmic'
        },
        bar_effect: {
          radius: '圓角',
          glass: '玻璃',
          gradient: '漸層',
          gradient_reverse: '反向漸層',
          shimmer: '微光',
          shimmer_reverse: '反向微光'
        },
        hide: {
          icon: '圖示',
          name: '名稱',
          value: '數值',
          unit: '單位',
          secondary_info: '補充資訊',
          progress_bar: '進度條'
        },
        unit_spacing: {
          auto: 'Auto',
          space: 'Space',
          'no-space': 'No space'
        },
        watermark_type: {
          blended: 'Blended',
          area: 'Area',
          striped: 'Striped',
          triangle: 'Triangle',
          round: 'Round',
          line: 'Line'
        },
        watermark_as: {
          auto: 'Auto',
          percent: 'Percent'
        },
        watermark: {
          low: 'Low',
          high: 'High',
          type: 'Type',
          opacity: 'Opacity',
          low_color: 'Low color',
          high_color: 'High color',
          low_as: 'Low unit',
          high_as: 'High unit',
          line_size: 'Line size',
          disable_low: 'Disable low',
          disable_high: 'Disable high',
          low_attribute: 'Attribute',
          high_attribute: 'Attribute'
        },
        icon_animation: {
          none: 'None',
          spin: 'Spin',
          pulse: 'Pulse',
          bounce: 'Bounce',
          shake: 'Shake',
          ping: 'Ping',
          reveal: 'Reveal',
          washing_machine: 'Washing machine',
          battery_charging: 'Battery charging'
        },
        alert_when: {
          above: 'Alert above',
          below: 'Alert below',
          color: 'Alert color',
          highlight: 'Highlight',
          animation: 'Animation'
        },
        alert_highlight: {
          border: 'Border',
          background: 'Background'
        },
        alert_animation: {
          static: 'Static',
          blink: 'Blink',
          ping: 'Ping'
        },
        min_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        max_value_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_low_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        watermark_high_mode: {
          standard: 'Fixed value',
          entity: 'Entity',
          jinja: 'Template'
        },
        theme_mode: {
          preset: 'Preset',
          custom: 'Custom'
        },
        min_value: {
          attribute: 'Attribute'
        },
        max_value: {
          attribute: 'Attribute'
        },
        bar_stack_mode: {
          stacked: 'Stacked',
          proportional: 'Sum',
          net: 'Net'
        }
      }
    }
  }
};
/* eslint-enable sonarjs/no-duplicate-string */

export { TRANSLATIONS };

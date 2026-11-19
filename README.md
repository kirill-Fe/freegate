# Сайт FreeGate

Статический сайт: чистый HTML + CSS + JS, без сборки, npm и внешних CDN.
Именно такой набор GitHub Pages раздаёт как есть.

```
docs/
├── index.html                 главная страница
├── 404.html                   страница ошибки
├── favicon.svg                иконка сайта
├── site.webmanifest           PWA-манифест
├── robots.txt
├── .nojekyll                  отключает обработку Jekyll
├── assets/
│   ├── css/style.css
│   └── js/main.js
├── download/
│   └── freegate-1.1.0.apk     сборка приложения
├── screenshot.png             скриншоты приложения
├── countries.png
├── import.png
├── settings.png
└── home.png
```

## Как опубликовать на GitHub Pages

1. Создайте репозиторий на GitHub и запушьте туда проект целиком
   (папка `docs/` должна попасть в репозиторий).

   ```bash
   git init
   git add .
   git commit -m "FreeGate: приложение и сайт"
   git branch -M main
   git remote add origin https://github.com/ВАШ-ЛОГИН/freegate.git
   git push -u origin main
   ```

2. В репозитории откройте **Settings → Pages**.
3. В блоке **Build and deployment**:
   - **Source**: `Deploy from a branch`;
   - **Branch**: `main`;
   - **Folder**: `/docs`.
4. Нажмите **Save** и подождите 1–2 минуты.
5. Сайт будет доступен по адресу `https://ВАШ-ЛОГИН.github.io/freegate/`.

Все ссылки на сайте относительные (`assets/...`, `download/...`, `screenshot.png`),
поэтому он корректно работает и в подпапке `/freegate/`, и на своём домене.

## Свой домен (необязательно)

1. Settings → Pages → **Custom domain** → впишите домен.
2. У регистратора добавьте `CNAME`-запись на `ВАШ-ЛОГИН.github.io`
   (для корневого домена — `A`-записи GitHub Pages).
3. Включите **Enforce HTTPS**.

## Локальный просмотр

Достаточно открыть `docs/index.html` в браузере. Для проверки скачивания APK
и манифеста удобнее поднять локальный сервер:

```bash
# Python 3
cd docs && python3 -m http.server 8080
# затем http://localhost:8080
```

На Windows без Python можно использовать любую статическую программу
или расширение «Live Server» в редакторе.

## Что обновить при выпуске новой версии

1. Собрать APK: `./gradlew assembleDebug`.
2. Положить его в `docs/download/` (имя с версией, например `freegate-1.1.0.apk`).
3. В `docs/index.html` заменить:
   - ссылки `download/freegate-*.apk` на новый файл;
   - размер, дату сборки и SHA-256 в блоке «Скачать»;
   - номер версии в заголовке и в CTA.
4. Обновить скриншоты в `docs/`, если менялся интерфейс.
5. Закоммитить и запушить — Pages обновится автоматически.

SHA-256 считается так:

```powershell
Get-FileHash docs\download\freegate-1.1.0.apk -Algorithm SHA256
```

```bash
sha256sum docs/download/freegate-1.1.0.apk
```

## Проверка перед публикацией

- [ ] Все ссылки открываются (в том числе `download/freegate-1.1.0.apk`).
- [ ] На телефоне работает меню-бургер и демо-кнопка.
- [ ] Скриншоты открываются в лайтбоксе.
- [ ] Кнопки «Копировать» копируют код и SHA-256.
- [ ] На сайте нет ссылок на несуществующие сборки для ПК:
      раздел «VPN для ПК» честно помечен как «в разработке».

# Assistant

... developing ...

TODO
- dialog + confirm
- Entity Level Security - ELS - как пакет. Прокинуть в http. Подключение чз класс-миксины
- ? как избавиться от таскания с собой ctx ?

Логика. Никак не смешать серврный код с клиентским, поэтому делим на общее -
- список сущностей - структура, и отдельные моменты для клиента и сервера.
structure - общий список сущностей со списком полей
AppClient - клиентский код - формы и т.п.
AppServer - серверный код - серверные функции
client - точка входа клиенского приложнения


Архитектурные требования:
- (1) переиспользование кода повторяющихся задач.
- (2) индивидуальные модификации при неизменности кода исходного решения.

Синтетические кейсы:
- (1) Общие сущности: Контрагенты - актуально и для учета и для CRM с зависимым справочником "Виды деятельности"
- (2) Доп поля. Добавить колонку "комментарий" в таб. части приходов.
- (1) Поля "Создал", "Изменил" заполняемые на сервере и отображаемые на форме
- (2) Разные названия прихода ден средств: "Приходы" "Поступления"
- (2) Другой метод расчета себестоимости списания (вместо "по средней", по цене из номенклатуры)

Sequelize позволяет создавать методы экземпляров и моделей. "Расширения" будут отрабатывать сначала
на уровне платформы, а потом будет создаваться модели.
Нет смысла тащить методы сущностей в методы модели - это простые функции - пусть
они остаются в сущностях. А вот для экземпляров удобно использовать sequelize.
(если они вообще потребуются).

Реализация (2) в формах будет внутри конструктора, где чз content можно будет поменять
любые атрибуты элементов формы и также добавить/удалить эти элементы.

Для реализации (2) приложения вместо работы с моделями seq будут работать с предопредленными методами сущностей. При этом будут возможны хаки типа проверки прав или расширения спец решения до сервиса.

Реализация (1) что на клиенте что на сервере объективно зависит не столько от платформы, сколько от способа реализации приложений на ней. Подход такой же как и сейчас в js разработке - можно решать свой частный случай, а можно сделать переиспользуемый модуль + доку по его использованию.

Потребуется хранить состояние пользователя. Как минимум для кэша проверки прав. Можно сделать обычные сессии. При масштабировании - увеличении кол-ва процессов - можно при попадании запроса от юзера по которому нет сессии - создавать. Это актуально для только кэша, с изменяемым состоянием не прокатит. Но вообще изменяемое состояние надо избегать, так что может обойдемся без него.

! Менеджеры разных сущностей вполне могут быть на разных серверах. При обращении из одной сущности к другой можно вызывать типа прокси класс, который будет обращаться по http к другому сервису. НЮАНС. Т.к. связи таблиц разрешаются на уровне запросов то такая схема будет работать только на замкнутой системе связей - т.е. без ссылочных полей на таблицы другого сервиса.

По факту - работа с экземплярами сущностей - метод организации кода, не более. При этом, вводится дополнительная абстрация. Не будем усложнять и оставим работу с данными на уровне "менеджеров" сущностей.


В прикладных задачах в общем случае наше приложение может иметь в основе несколько других: блок "Учет", блок "CRM", блок "Задачи".
Наследование тут не применить - в классах js нет множественного наследования.
Композиция в общем понимании нам тоже не подходит: мы не используем внутри нашего решения классы из других блоков, а строим его на сочетании классов из других блоков.
Таким образом, раз нам нужно сочетание - будем применять термин "модули". Тем более что это согласуется с общепринятой терминологией node.js (package - модуль).
Архитектурное решение должно позволять нам указывать набор модулей, из которых состоит наше приложение. В общем случае, может быть так, что модули могут иметь пересекающиеся зависимости, что должно учитываться. Разрешение зависимостей при этом мы делегируем npm.
Само разрабатываемое приложение тоже должно быть модулем, для обеспечения требования (2).


Архитектурное решение.

Приложение со стороны клиента представляет собой набор Форм, со стороны сервера - набором Сущностей. Формы и Сущности описываются классами, Приложения - "классовыми миксинами".
Требование (1) реализуется принципом разработки - выделением частей приложения в переиспользуемые модули.
Требование (2) реализуется штатными механизмами наследования и композиции классов: вместо модификации Базового решения мы либо наследуем свои классы от него либо используем их в своих классах.





==========================

Сущность - аналог класса в общем понимании ООП - структурная единица программы описывающая однотипные объекты предметной области ("Товары", "Контрагенты") или реализующая некоторый функционал ("Отчет по продажам").

Сущности - на сервере.

На клиенте - только набор форм. Формы могут быть открыты из меню или по событиям из других форм. Задача кастомизации меню и форм под пользователя решается асинхронным init в клиентском приложении (доработка kate-component в kate-client с передачей метода по аналогии с showAlert).

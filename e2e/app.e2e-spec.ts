import { MediatorAngularPage } from './app.po';

describe('mediator-angular App', () => {
  let page: MediatorAngularPage;

  beforeEach(() => {
    page = new MediatorAngularPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

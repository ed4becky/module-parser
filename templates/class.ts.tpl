import { createSpyObj } from <%=quoteSymbol %>jest-createspyobj<%=quoteSymbol %>;
import { <%=name %> } from <%=quoteSymbol %><%=path %><%=quoteSymbol %>;<%
  imports.forEach(function(value) { %>
import { <%=value.names.join(', ') %> } from <%=value.path %>;<% }) %>

describe(<%=quoteSymbol %><%=name %><%=quoteSymbol %>, () => {
  let <%=instanceVariableName %>: <%=name %>;<%
    ngDeclaractions.forEach(function(dec) { %>
  let <%=dec.name %>: <%=dec.type %>;<% }) %>

  function create<%=templateType %>() {
    <%=instanceVariableName %> = new <%=name %>(<%
      dependencies.forEach(function(dep) { %>
      <%=dep.name%>,<% }) %>
    );
  }

  beforeEach(() => {<%
    initializers.forEach(function(factory) { %>
    <%=(factory.name ? (factory.name + ' = ') : '') + factory.value %>;<% }) %>

    create<%=templateType %>();
  });

  it(<%=quoteSymbol %>should create<%=quoteSymbol %>, () => {
    expect(<%=instanceVariableName %>).toBeTruthy();
  });

});

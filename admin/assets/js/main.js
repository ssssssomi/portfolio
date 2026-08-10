(function(){
  'use strict';

  var uiScript = {
    init: function(){
      this.gnb.init();
      this.tab.init();
      this.datepicker.init();
      this.table.init();
    },

    /* ---------- 사이드 GNB 아코디언 ---------- */
    gnb: {
      init: function(){
        document.querySelectorAll('.pub-gnb--btn').forEach(function(btn){
          btn.addEventListener('click', function(){
            var expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(!expanded));
          });
        });
      }
    },

    /* ---------- 탭 ---------- */
    tab: {
      init: function(){
        var tabs = document.querySelectorAll('[role="tab"]');
        tabs.forEach(function(tab, i){
          tab.addEventListener('click', function(){
            tabs.forEach(function(t){ t.setAttribute('aria-selected','false'); });
            tab.setAttribute('aria-selected','true');
          });
          tab.addEventListener('keydown', function(e){
            if(e.key === 'ArrowRight' || e.key === 'ArrowLeft'){
              e.preventDefault();
              var next = e.key === 'ArrowRight' ? (i+1) % tabs.length : (i-1+tabs.length) % tabs.length;
              tabs[next].focus();
              tabs[next].click();
            }
          });
        });
      }
    },

    /* ---------- 데이트피커 ---------- */
    datepicker: {
      state: { view: new Date(2021,3,1), selected: new Date(2021,3,2) },
      els: {},
      init: function(){
        var self = this;
        this.els = {
          root: document.getElementById('datepicker'),
          field: document.getElementById('dpField'),
          value: document.getElementById('dpValue'),
          panel: document.getElementById('dpPanel'),
          current: document.getElementById('dpCurrent'),
          body: document.getElementById('dpBody'),
          today: document.getElementById('dpToday')
        };
        if(!this.els.root) return;

        this.els.field.addEventListener('click', function(){ self.toggle(); });

        this.els.panel.addEventListener('click', function(e){
          var nav = e.target.closest('[data-nav]');
          if(nav){ self.move(nav.dataset.nav); return; }
          var day = e.target.closest('.pub-datepicker--day');
          if(day){ self.select(new Date(+day.dataset.y, +day.dataset.m, +day.dataset.d)); }
        });

        this.els.today.addEventListener('click', function(){
          var now = new Date();
          self.state.view = new Date(now.getFullYear(), now.getMonth(), 1);
          self.select(now);
        });

        document.addEventListener('click', function(e){
          if(!self.els.root.contains(e.target)) self.close();
        });
        document.addEventListener('keydown', function(e){
          if(e.key === 'Escape' && !self.els.panel.hidden){
            self.close();
            self.els.field.focus();
          }
        });

        this.render();
      },
      toggle: function(){
        this.els.panel.hidden ? this.open() : this.close();
      },
      open: function(){
        this.els.panel.hidden = false;
        this.els.field.setAttribute('aria-expanded','true');
        this.els.root.classList.add('is-open');
        var sel = this.els.body.querySelector('.is-selected') || this.els.body.querySelector('.pub-datepicker--day');
        if(sel) sel.focus();
      },
      close: function(){
        this.els.panel.hidden = true;
        this.els.field.setAttribute('aria-expanded','false');
        this.els.root.classList.remove('is-open');
      },
      move: function(dir){
        var v = this.state.view;
        if(dir === 'prev-month') this.state.view = new Date(v.getFullYear(), v.getMonth()-1, 1);
        if(dir === 'next-month') this.state.view = new Date(v.getFullYear(), v.getMonth()+1, 1);
        if(dir === 'prev-year')  this.state.view = new Date(v.getFullYear()-1, v.getMonth(), 1);
        if(dir === 'next-year')  this.state.view = new Date(v.getFullYear()+1, v.getMonth(), 1);
        this.render();
      },
      select: function(date){
        this.state.selected = date;
        this.els.value.textContent = this.format(date);
        this.render();
        this.close();
        this.els.field.focus();
      },
      format: function(d){
        var mm = String(d.getMonth()+1).padStart(2,'0');
        var dd = String(d.getDate()).padStart(2,'0');
        return d.getFullYear() + '-' + mm + '-' + dd;
      },
      render: function(){
        var v = this.state.view, sel = this.state.selected, today = new Date();
        this.els.current.textContent = v.getFullYear() + '년 ' + (v.getMonth()+1) + '월';

        var first = new Date(v.getFullYear(), v.getMonth(), 1);
        var start = new Date(first);
        start.setDate(1 - first.getDay()); // 주 시작(일요일)로 이동

        var html = '';
        for(var w = 0; w < 6; w++){
          html += '<tr>';
          for(var d = 0; d < 7; d++){
            var cur = new Date(start);
            cur.setDate(start.getDate() + w*7 + d);
            var cls = 'pub-datepicker--day';
            if(cur.getMonth() !== v.getMonth()) cls += ' is-muted';
            if(this.same(cur, sel)) cls += ' is-selected';
            if(this.same(cur, today)) cls += ' is-today';
            html += '<td><button type="button" class="' + cls + '"' +
              ' data-y="' + cur.getFullYear() + '" data-m="' + cur.getMonth() + '" data-d="' + cur.getDate() + '"' +
              ' aria-label="' + cur.getFullYear() + '년 ' + (cur.getMonth()+1) + '월 ' + cur.getDate() + '일"' +
              (this.same(cur, sel) ? ' aria-current="date"' : '') +
              '>' + cur.getDate() + '</button></td>';
          }
          html += '</tr>';
        }
        this.els.body.innerHTML = html;
      },
      same: function(a, b){
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
      }
    },

    /* ---------- 테이블 전체 선택 ---------- */
    table: {
      init: function(){
        var all = document.getElementById('chkAll');
        if(!all) return;
        var rows = document.querySelectorAll('tbody .pub-chk');
        all.addEventListener('change', function(){
          rows.forEach(function(chk){ chk.checked = all.checked; });
        });
        rows.forEach(function(chk){
          chk.addEventListener('change', function(){
            var checked = Array.prototype.filter.call(rows, function(c){ return c.checked; }).length;
            all.checked = checked === rows.length;
            all.indeterminate = checked > 0 && checked < rows.length;
          });
        });
      }
    }
  };

  uiScript.init();
})();
